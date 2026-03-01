import os
from crewai.tools import tool
from crewai import Agent, Task, Crew, LLM

from barackollama.flows.linkedin_flow import kickoff_linkedin_flow
from barackollama.flows.github_scrape_flow import kickoff_github_scrape_flow
from barackollama.flows.resume_flow import kickoff_resume_flow


@tool("scrape_linkedin_profile")
def scrape_linkedin_profile(linkedin_url: str) -> str:
    """Scrapes a LinkedIn profile URL and returns the parsed JSON profile data."""
    return str(kickoff_linkedin_flow(linkedin_url))


@tool("analyze_github_repos")
def analyze_github_repos(github_handle: str) -> str:
    """Analyzes all repositories for a GitHub handle and returns a comprehensive markdown summary."""
    return str(kickoff_github_scrape_flow(github_handle))


@tool("generate_portfolio_assets")
def generate_portfolio_assets(linkedin_json: str, repos_markdown: str, job_url: str, github_handle: str) -> str:
    """Uses LinkedIn profile data and GitHub repository markdown to generate a tailored resume and portfolio website for a specific job URL."""
    result = kickoff_resume_flow(linkedin_json, repos_markdown, job_url, github_handle)
    return f"""Generated Assets Successfully!
GitHub Profile README: {result.get('github_profile_url', '')}
Portfolio Website: {result.get('portfolio_website_url', '')}
Resume HTML Output Length: {len(result.get('resume_html', ''))}
Resume PDF: {result.get('resume_pdf_path', '')}
"""


def create_chat_crew() -> Crew:
    """Creates the top-level chat orchestrator Crew for CopilotKit."""
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )

    chat_agent = Agent(
        role="Career Portfolio Architect AI",
        goal="Assist the user in generating highly-tailored resumes and portfolios by utilizing the LinkedIn scraper, GitHub scraper, and Asset Generator tools.",
        backstory=(
            "You are Barack Ollama, the top-level assistant. You have three powerful tools: "
            "one to scrape LinkedIn, one to analyze GitHub repos, and one to generate the final resume and portfolio site based on a job posting. "
            "You converse with the user to get their links, run the tools in order, and present the final URLs."
        ),
        verbose=True,
        tools=[scrape_linkedin_profile, analyze_github_repos, generate_portfolio_assets],
        llm=llm
    )

    chat_task = Task(
        description="Respond to the user's latest query, utilizing your scraping and generation tools when requested.",
        expected_output="A helpful, conversational response to the user, including updates on task progress.",
        agent=chat_agent
    )

    return Crew(
        agents=[chat_agent],
        tasks=[chat_task]
    )
