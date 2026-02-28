import os
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, LLM
from barackollama.tools.linkedin_tools import fetch_linkedin_profile_details

class LinkedInProfileResult(BaseModel):
    profile_json: str = Field(description="The comprehensive JSON string representing the user's LinkedIn profile data")

def create_linkedin_crew() -> Crew:
    """
    Creates the LinkedIn Profile Extraction Crew.
    This crew takes a LinkedIn URL, scrapes the complete profile, and outputs it as JSON.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    linkedin_scraper_agent = Agent(
        role="LinkedIn Data Architect",
        goal="Extract deeply detailed, accurate career history data from LinkedIn profiles.",
        backstory=(
            "You are an expert data engineer specializing in OSINT and professional network scraping. "
            "You know how to securely invoke APIs to extract full career timelines, project history, "
            "and certification data, ensuring no critical details are lost."
        ),
        verbose=True,
        tools=[fetch_linkedin_profile_details],
        llm=llm
    )
    
    scrape_task = Task(
        description=(
            "Use the 'Fetch LinkedIn Profile Details' tool to scrape data for the following URL: {linkedin_url}\n"
            "Once retrieved, return the exact, comprehensive JSON structure untouched so it can be passed "
            "to downstream career generation agents."
        ),
        expected_output="A robust JSON string containing the candidate's complete background.",
        agent=linkedin_scraper_agent,
        output_pydantic=LinkedInProfileResult
    )

    return Crew(
        agents=[linkedin_scraper_agent],
        tasks=[scrape_task]
    )
