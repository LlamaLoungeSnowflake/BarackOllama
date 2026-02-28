import os
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, LLM
from barackollama.tools.composio_setup import get_github_tools

class DeployResult(BaseModel):
    github_profile_url: str = Field(description="URL to the created GitHub profile repository")
    portfolio_website_url: str = Field(description="URL to the created GitHub pages static website repository")

def create_deployment_crew(github_handle: str) -> Crew:
    """
    Creates the Deployment Crew.
    This crew pushes the final assets to GitHub using Composio.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    deployment_agent = Agent(
        role="DevOps & GitHub Manager",
        goal="Seamlessly deploy generated portfolio assets, markdown files, and HTML resumes to GitHub repositories.",
        backstory=(
            "You are a DevOps and Deployment expert. Your job is to take the final generated "
            "Markdown README, HTML portfolio websites, and now the HTML string of the candidate's resume, "
            "and push them to the correct GitHub repositories via the Composio API."
        ),
        verbose=True,
        tools=get_github_tools(github_handle),
        llm=llm
    )
    
    deploy_assets_task = Task(
        description=(
            "You have been provided with two assets:\n"
            "1. A personalized GitHub Profile README markdown.\n"
            "2. The HTML/Tailwind CSS code for a static portfolio website.\n"
            "3. The final generated HTML Resume string.\n\n"
            "Readme Markdown Content: {github_readme_markdown}\n"
            "Portfolio HTML Content: {portfolio_website_code}\n"
            "HTML Resume Content: {resume_html}\n"
            "Username Target: {github_handle}\n"
            "Portfolio Repo Name: {portfolio_repo_name}\n"
            "Resume File Name: {resume_file_name}\n\n"
            "Your task is to use your GitHub tools to:\n"
            "1. Create/Update a repository named '{github_handle}' and push the README.md to the main branch.\n"
            "2. Create a repository named '{portfolio_repo_name}' and push the HTML code as 'index.html'. Also push the HTML Resume content to this repository as '{resume_file_name}'.\n"
            "Return the URLs of all created/updated repositories."
        ),
        expected_output="A JSON object containing the URLs to the newly created repositories.",
        agent=deployment_agent,
        output_pydantic=DeployResult
    )

    return Crew(
        agents=[deployment_agent],
        tasks=[deploy_assets_task]
    )
