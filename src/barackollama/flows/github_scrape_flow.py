import os
import requests
from pydantic import BaseModel
from crewai.flow.flow import Flow, listen, start
from concurrent.futures import ThreadPoolExecutor, as_completed
from barackollama.crews.github_scrape_crew import create_repo_analysis_crew

class GitHubScrapeFlowState(BaseModel):
    github_handle: str = ""
    repositories: list[str] = []
    analyzed_repos: list[dict] = []
    final_markdown: str = ""

class GitHubScrapeFlow(Flow[GitHubScrapeFlowState]):
    """
    A prequel flow that discovers all repositories for a user, analyzes them in parallel
    (bounded), and generates an exhaustive aggregated markdown document.
    """
    
    @start()
    def fetch_repo_list(self):
        print(f"Fetching public repositories for GitHub handle: {self.state.github_handle}")
        url = f"https://api.github.com/users/{self.state.github_handle}/repos?per_page=100&sort=updated"
        
        # We can use a GitHub token if available to avoid unauthenticated rate limits, 
        # but public repos are accessible without it.
        headers = {"Accept": "application/vnd.github.v3+json"}
        gh_token = os.getenv("GITHUB_TOKEN")
        if gh_token:
             headers["Authorization"] = f"token {gh_token}"
             
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            # Just grab the names
            self.state.repositories = [repo["name"] for repo in data if not repo.get("fork", False)]
            print(f"Discovered {len(self.state.repositories)} original public repositories.")
        else:
            print(f"GitHub API Error: {response.status_code} - {response.text}")
            self.state.repositories = []
            
        return self.state.repositories

    def analyze_single_repo(self, repo_name: str, github_tools) -> dict:
        print(f"Starting analysis for {repo_name}...")
        crew = create_repo_analysis_crew(github_tools=github_tools)
        
        try:
            result = crew.kickoff(inputs={
                "github_handle": self.state.github_handle,
                "repo_name": repo_name
            })
            
            output = result.pydantic
            if output:
                return output.model_dump()
            else:
                print(f"Warning: Did not get Pydantic output for {repo_name}")
                return None
        except Exception as e:
            print(f"Error analyzing {repo_name}: {e}")
            return None

    @listen(fetch_repo_list)
    def parallel_analyze(self):
        if not self.state.repositories:
            print("No repositories to analyze.")
            return
            
        # Read concurrency limit from env, default to 5
        max_workers = int(os.getenv("GITHUB_SCRAPE_CONCURRENCY", "5"))
        print(f"Starting parallel analysis using {max_workers} threads...")
        
        from barackollama.tools.composio_setup import get_github_tools
        shared_github_tools = get_github_tools(self.state.github_handle)
        
        analyzed_results = []
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all repo tasks
            future_to_repo = {executor.submit(self.analyze_single_repo, repo_name, shared_github_tools): repo_name for repo_name in self.state.repositories}
            
            # Process as they complete
            for future in as_completed(future_to_repo):
                repo_name = future_to_repo[future]
                try:
                    data = future.result()
                    if data:
                        analyzed_results.append(data)
                        print(f"✅ Finished analyzing {repo_name} (Valid: {data.get('is_valid')})")
                except Exception as exc:
                    print(f"💥 {repo_name} generated an exception: {exc}")
                    
        self.state.analyzed_repos = analyzed_results

    @listen(parallel_analyze)
    def compile_markdown(self):
        print("Compiling final GitHub Portfolio Markdown...")
        
        # 1. Filter out invalid repos
        valid_repos = [r for r in self.state.analyzed_repos if r.get("is_valid", False)]
        
        # 2. Sort reverse chronologically by 'updated_at' string
        valid_repos.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        
        # 3. Compile markdown
        md_lines = ["# Comprehensive GitHub Portfolio Analysis\n"]
        
        for repo in valid_repos:
            md_lines.append(f"## {repo['repo_name']}")
            md_lines.append(f"**Last Updated:** {repo.get('updated_at', 'Unknown')}")
            md_lines.append(f"\n**Summary:**\n{repo['summary']}\n")
            
            tech_list = ", ".join(repo.get('technologies', []))
            md_lines.append(f"**Technologies:** {tech_list}")
            
            keyword_list = ", ".join(repo.get('keywords', []))
            md_lines.append(f"**Resume Keywords:** {keyword_list}\n")
            md_lines.append("---\n")
            
        self.state.final_markdown = "\n".join(md_lines)
        return self.state.final_markdown

def kickoff_github_scrape_flow(github_handle: str) -> str:
    flow = GitHubScrapeFlow()
    flow.state.github_handle = github_handle
    return flow.kickoff()
