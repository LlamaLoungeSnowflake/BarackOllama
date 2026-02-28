import os
from pydantic import BaseModel, Field
from typing import List
from crewai import Agent, Task, Crew, LLM

# Define output Pydantic models for structured output
class KeywordExtractionResult(BaseModel):
    keywords: List[str] = Field(description="A list of 10-15 highly relevant keywords, technologies, or concepts extracted from the job listing.")

class RankedRepo(BaseModel):
    repo_name: str = Field(description="The name of the GitHub repository")
    relevance_score: int = Field(description="Score from 1-100 on how relevant this repo is to the job listing")
    reasoning: str = Field(description="One sentence explaining why it is relevant")

class RankedReposResult(BaseModel):
    ranked_repos: List[RankedRepo] = Field(description="List of github repositories ranked by relevance to the job listing")


def create_research_crew() -> Crew:
    """
    Creates the Research Crew responsible for extracting keywords from a job listing,
    and ranking the user's existing GitHub repositories based on those keywords.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    research_agent = Agent(
        role="Technical Career Researcher",
        goal="Analyze job listings and technical portfolios to find optimal matches and key qualifications.",
        backstory=(
            "You are an expert technical recruiter and portfolio analyst. "
            "You excel at reading dense technical job descriptions, identifying the core "
            "technologies and skills required, and mapping them to a candidate's existing work."
        ),
        verbose=True,
        llm=llm
    )
    
    extract_keywords_task = Task(
        description=(
            "Analyze the following job listing JSON data and extract the most critical "
            "technological keywords, concepts, and skills required for the role.\n"
            "Job Listing Data: {job_listing_data}"
        ),
        expected_output="A structured list of 10-15 highly relevant keywords extracted from the job listing.",
        agent=research_agent,
        output_pydantic=KeywordExtractionResult
    )

    rank_repos_task = Task(
        description=(
            "Given the extracted keywords from the previous task (provided in your context), analyze the candidate's "
            "GitHub repository summaries and rank them based on relevance to the job requirements.\n"
            "Candidate's GitHub Repositories: {github_repos}"
        ),
        expected_output="A ranked list of the candidate's repositories with relevance scores and reasoning.",
        agent=research_agent,
        output_pydantic=RankedReposResult,
        context=[extract_keywords_task]
    )

    return Crew(
        agents=[research_agent],
        tasks=[extract_keywords_task, rank_repos_task]
    )
