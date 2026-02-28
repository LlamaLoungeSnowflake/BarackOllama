import os
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, LLM

class ResumeResult(BaseModel):
    resume_markdown: str = Field(description="The complete highly tailored Markdown resume")

def create_resume_crew() -> Crew:
    """
    Creates the Resume Generation Crew.
    This crew takes all context (Job, LinkedIn, ranked repos, and newly generated links)
    to build the ultimate customized resume.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    resume_writer_agent = Agent(
        role="Executive Technical Resume Writer",
        goal="Craft highly targeted resumes that perfectly align a candidate's background with a specific job listing.",
        backstory=(
            "You are a world-class executive resume writer specializing in tech roles. "
            "You know how to weave keywords naturally, highlight relevance, and position "
            "candidates as the undeniable best fit for a role."
        ),
        verbose=True,
        llm=llm
    )
    
    generate_resume_task = Task(
        description=(
            "Generate a highly customized, professional resume in Markdown format.\n"
            "It must be tailored directly to this job listing summary: {job_listing_data}\n\n"
            "Incorporate the following information intelligently:\n"
            "1. Candidate Background (from LinkedIn): {linkedin_profile}\n"
            "2. Relevant Projects (Ranked Repositories): {ranked_repos}\n"
            "3. Include links to the candidate's newly generated artifacts:\n"
            "   - GitHub Profile: {github_profile_url}\n"
            "   - Portfolio Website: {portfolio_website_url}\n\n"
            "Ensure the tone is professional, achievement-oriented, and heavily utilizes "
            "the keywords implied by the job listing."
        ),
        expected_output="The full customized resume in Markdown string format.",
        agent=resume_writer_agent,
        output_pydantic=ResumeResult
    )

    return Crew(
        agents=[resume_writer_agent],
        tasks=[generate_resume_task]
    )
