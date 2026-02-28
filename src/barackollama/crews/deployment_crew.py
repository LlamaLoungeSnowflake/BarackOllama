import os
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, LLM
from barackollama.tools.composio_setup import get_github_tools

class DeployResult(BaseModel):
    github_profile_url: str = Field(description="URL to the created GitHub profile repository")
    portfolio_website_url: str = Field(description="URL to the created GitHub pages static website repository")

def create_deployment_crew() -> Crew:
    """
    Creates the Deployment Crew responsible for taking the generated Markdown and HTML
    and using Composio GitHub tools to create the repositories and push the code.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    deployment_agent = Agent(
        role="DevOps & GitHub Manager",
        goal="Automate the creation of GitHub repositories and deployment of code/assets.",
        backstory=(
            "You are an expert platform engineer who leverages GitHub APIs to "
            "programmatically create repositories, commit code, and configure GitHub Pages."
        ),
        verbose=True,
        tools=get_github_tools(),
        llm=llm
    )
    
    deploy_assets_task = Task(
        description=(
            "You have been provided with two assets:\n"
            "1. A personalized GitHub Profile README markdown.\n"
            "2. The HTML/Tailwind CSS code for a static portfolio website.\n\n"
            "Readme Markdown Content: {github_readme_markdown}\n"
            "Portfolio HTML Content: {portfolio_website_code}\n"
            "Username Target: {github_handle}\n\n"
            "Your task is to use your GitHub tools to:\n"
            "1. Create/Update a repository named '{github_handle}' and push the README.md to the main branch.\n"
            "2. Create a repository named 'custom-portfolio' and push the HTML code as 'index.html'.\n"
            "Return the URLs of both repositories."
        ),
        expected_output="A JSON object containing the URLs to the newly created repositories.",
        agent=deployment_agent,
        output_pydantic=DeployResult
    )

    return Crew(
        agents=[deployment_agent],
        tasks=[deploy_assets_task]
    )
