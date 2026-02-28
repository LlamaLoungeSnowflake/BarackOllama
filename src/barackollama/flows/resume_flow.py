import os
from pydantic import BaseModel
from weasyprint import HTML
from crewai.flow.flow import Flow, listen, start
from barackollama.crews.research_crew import create_research_crew, KeywordExtractionResult, RankedReposResult
from barackollama.crews.content_crew import create_content_crew, GeneratedContentResult
from barackollama.crews.deployment_crew import create_deployment_crew, DeployResult
from barackollama.crews.resume_crew import create_resume_crew, ResumeResult
from barackollama.tools.get_job_listing import get_job_listing

class ResumeFlowState(BaseModel):
    # Inputs
    job_url: str = ""
    linkedin_profile: str = ""
    github_repos: str = ""
    github_handle: str = ""
    
    # Intermediate state
    job_listing_data: dict = {}
    keywords: list[str] = []
    ranked_repos: list[dict] = []
    github_profile_markdown: str = ""
    portfolio_website_code: str = ""
    github_profile_url: str = ""
    portfolio_website_url: str = ""
    resume_html: str = ""
    resume_pdf_path: str = ""

class ResumeFlow(Flow[ResumeFlowState]):
    """
    Orchestrates the Custom Resume Generation Flow.
    """

    @start()
    def fetch_job_data(self):
        print(f"Fetching job data for URL: {self.state.job_url}")
        try:
            self.state.job_listing_data = get_job_listing(self.state.job_url)
            print("Successfully fetched job data.")
        except Exception as e:
            print(f"Error fetching job data: {e}. Will proceed with an empty job summary.")
            self.state.job_listing_data = {"error": "Failed to load"}

    @listen(fetch_job_data)
    def extract_and_rank(self):
        print("Extracting keywords and ranking repositories...")
        research_crew = create_research_crew()
        
        result = research_crew.kickoff(inputs={
            "job_listing_data": str(self.state.job_listing_data),
            "github_repos": self.state.github_repos
        })
        
        # CrewAI returns a CrewOutput, we use pydantic extraction if defined on the tasks
        try:
            # Assuming the last task (rank_repos_task) returns the RankedReposResult pydantic shape
            ranked_output = result.pydantic
            if ranked_output:
                # Store them
                self.state.ranked_repos = [repo.dict() for repo in ranked_output.ranked_repos]
            else:
                self.state.ranked_repos = result.raw
        except Exception as e:
            print(f"Extraction parsing warning: {e}")
            self.state.ranked_repos = result.raw

    @listen(extract_and_rank)
    def generate_assets(self):
        print("Generating modern README and HTML Portfolio...")
        content_crew = create_content_crew()
        
        result = content_crew.kickoff(inputs={
            "linkedin_profile": self.state.linkedin_profile,
            "ranked_repos": str(self.state.ranked_repos),
            "job_listing_data": str(self.state.job_listing_data),
            "github_handle": self.state.github_handle
        })
        
        try:
            content_output = result.pydantic
            if content_output:
                self.state.github_profile_markdown = content_output.github_readme_markdown
                self.state.portfolio_website_code = content_output.portfolio_website_code
            else:
                self.state.github_profile_markdown = result.raw
        except Exception as e:
            print(f"Asset Generation parsing warning: {e}")

    @listen(generate_resume_html)
    def deploy_assets(self):
        print("Deploying assets to GitHub via Composio...")
        if not self.state.github_profile_markdown:
            print("No assets to deploy")
            return

        deployment_crew = create_deployment_crew()
        
        result = deployment_crew.kickoff(inputs={
            "github_readme_markdown": self.state.github_profile_markdown,
            "portfolio_website_code": self.state.portfolio_website_code,
            "resume_html": self.state.resume_html,
            "github_handle": self.state.github_handle
        })
        
        try:
            deploy_output = result.pydantic
            if deploy_output:
                self.state.github_profile_url = deploy_output.github_profile_url
                self.state.portfolio_website_url = deploy_output.portfolio_website_url
            else:
                self.state.github_profile_url = f"https://github.com/{self.state.github_handle}/{self.state.github_handle}"
        except Exception as e:
             print(f"Deploy parsing warning: {e}")

    @listen(generate_assets)
    def generate_resume_html(self):
        print("Generating final highly-tailored resume in HTML...")
        resume_crew = create_resume_crew()
        
        result = resume_crew.kickoff(inputs={
            "job_listing_data": str(self.state.job_listing_data),
            "linkedin_profile": self.state.linkedin_profile,
            "ranked_repos": str(self.state.ranked_repos),
            "github_profile_url": self.state.github_profile_url,
            "portfolio_website_url": self.state.portfolio_website_url
        })
        
        try:
            resume_output = result.pydantic
            if resume_output:
                self.state.resume_html = resume_output.resume_html
            else:
                self.state.resume_html = result.raw
        except Exception as e:
            print(f"Resume parsing warning: {e}")
            self.state.resume_html = result.raw

    @listen(generate_resume_html)
    def compile_pdf(self):
        print("Compiling HTML to PDF using WeasyPrint...")
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        
        html_path = os.path.join(output_dir, "resume.html")
        pdf_path = os.path.join(output_dir, "resume.pdf")
        
        # Write the HTML output for inspection
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(self.state.resume_html)
            
        print(f"Saved intermediate HTML to {html_path}")
        
        # Compile the PDF
        try:
            HTML(string=self.state.resume_html).write_pdf(pdf_path)
            self.state.resume_pdf_path = pdf_path
            print(f"✅ Successfully compiled PDF to {pdf_path}")
        except Exception as e:
            print(f"❌ Failed to compile PDF: {e}")
            self.state.resume_pdf_path = ""
            
        return self.state.resume_pdf_path

def kickoff_resume_flow(linkedin: str, repos: str, job_url: str, github_handle: str):
    flow = ResumeFlow()
    # Initialize state inputs before running
    flow.state.linkedin_profile = linkedin
    flow.state.github_repos = repos
    flow.state.job_url = job_url
    flow.state.github_handle = github_handle
    
    final_resume = flow.kickoff()
    print("========= FINAL RESUME =========")
    print(final_resume)
    return final_resume
