import os
from pydantic import BaseModel, Field
from typing import List
from crewai import Agent, Task, Crew, LLM

class GeneratedContentResult(BaseModel):
    github_readme_markdown: str = Field(description="The full Markdown text for the customized GitHub profile README")
    portfolio_website_code: str = Field(description="The complete self-contained HTML/Tailwind CSS code for the static portfolio website")

def create_content_crew() -> Crew:
    """
    Creates the Content Generation Crew. 
    This crew is responsible for taking the ranked repositories, extracted keywords, 
    and LinkedIn profile, and generating both a customized GitHub profile README and an HTML/CSS portfolio website.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    content_creator_agent = Agent(
        role="Content Marketing & Developer Advocate",
        goal="Generate compelling, highly tailored developer portfolios and READMEs that highlight specific targeted skills.",
        backstory=(
            "You are an expert developer advocate and technical writer. You specialize "
            "in presenting technical projects in the best possible light for specific target audiences, "
            "like recruiters and engineering managers."
        ),
        verbose=True,
        llm=llm
    )
    
    generate_assets_task = Task(
        description=(
            "Using the candidate's LinkedIn Profile, the Ranked Repositories, and the Job Listing Data, "
            "generate two distinct assets:\n"
            "1. A highly personalized GitHub Profile README (markdown). It must include this metrics section:\n"
            "<p align=\"left\">\n  <img alt=\"Github Stats\" src=\"https://github-readme-stats.vercel.app/api?username={github_handle}&show_icons=true\" />\n  <br>\n  <img alt=\"Github Streak\" src=\"https://github-readme-streak-stats.herokuapp.com?user={github_handle}&border_radius=5&mode=weekly\" />\n  <br>\n  <img alt=\"Top Language\" src=\"https://github-readme-stats.vercel.app/api/top-langs/?username={github_handle}&hide=html,css&layout=compact\" />\n</p>\n\n"
            "2. A modern, single-file HTML/Tailwind CSS static portfolio website featuring the same top projects and career data.\n\n"
            "Data to use:\n"
            "LinkedIn Profile: {linkedin_profile}\n"
            "Ranked Repositories: {ranked_repos}\n"
            "Job Summary (for tailoring): {job_listing_data}"
        ),
        expected_output="A JSON object containing the markdown string for the README and the HTML string for the website.",
        agent=content_creator_agent,
        output_pydantic=GeneratedContentResult
    )

    return Crew(
        agents=[content_creator_agent],
        tasks=[generate_assets_task]
    )
