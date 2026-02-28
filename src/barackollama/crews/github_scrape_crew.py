import os
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, LLM
from barackollama.tools.composio_setup import get_github_tools

class RepoAnalysisResult(BaseModel):
    repo_name: str = Field(description="The name of the repository.")
    summary: str = Field(description="A comprehensive but concise LLM-generated summary of the repository's purpose and functionality.")
    technologies: list[str] = Field(description="A list of programming languages and specific tech stack components used in the project.")
    keywords: list[str] = Field(description="A dense array of resume-worthy keywords (methods, architectures, concepts) utilized in this repo.")
    is_valid: bool = Field(description="True if this repository is significant and technical enough for a resume. False if it is just an empty fork, only binary images, or non-technical.")
    updated_at: str = Field(description="The last updated timestamp retrieved from GitHub metadata, formatted as ISO string. If unavailable, return an empty string.")


def create_repo_analysis_crew() -> Crew:
    """
    Creates a Crew explicitly for analyzing a single GitHub repository.
    Includes the Inspector, Enhancer, and Judge agents.
    """
    llm = LLM(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/minimax/minimax-m2.5"),
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )

    inspector_agent = Agent(
        role="Repository Inspector",
        goal="Fetch deep repository metadata, read the README.md, and formulate an initial technical summary and technology list.",
        backstory=(
            "You are a fastidious technical code reviewer. You leverage the Composio GitHub API to peer deeply "
            "into repositories, extracting core purpose, logic, languages, and technical frameworks used."
        ),
        verbose=True,
        tools=get_github_tools(),
        llm=llm
    )

    enhancer_agent = Agent(
        role="Career Strategy Keyword Enhancer",
        goal="Read raw project summaries and rigorously expand the list of resume-worthy technical keywords.",
        backstory=(
            "You are an expert IT recruiter and AI keyword strategist. Your superpower is taking basic project summaries "
            "and deriving the high-value resume concepts (e.g., 'CI/CD pipeline', 'Microservices', 'State Management') "
            "that ATS systems look for in top candidates, adding them aggressively to the keyword list."
        ),
        verbose=True,
        llm=llm
    )

    judge_agent = Agent(
        role="Technical Resume Judge",
        goal="Filter out noise by determining if a repository actually merits inclusion on an executive software engineering resume.",
        backstory=(
            "You are the gatekeeper of a candidate's portfolio. You instantly recognize when a repository is just a "
            "meaningless fork used to submit a one-line bugfix PR upstream, or if it is devoid of code (just images/text). "
            "You set the 'is_valid' flag to False to prevent these from diluting the candidate's professional resume."
        ),
        verbose=True,
        llm=llm
    )

    inspect_task = Task(
        description=(
            "Inspect the repository: {github_handle}/{repo_name}\n"
            "Use your GitHub tools to fetch the repository metadata and, critically, read the contents of the README.md file.\n"
            "Draft a comprehensive summary of what the project does, note its last updated date, and build the initial list of programming languages and technologies."
        ),
        expected_output="Detailed summary, last updated date, and technology list of the repository.",
        agent=inspector_agent
    )

    enhance_task = Task(
        description=(
            "Review the repository summary produced by the inspector agent.\n"
            "Read between the lines and extract an exhaustive, targeted list of technical keywords "
            "(methods, tools, concepts, architectures) that elevate the candidate's resume.\n"
            "Merge these with any initial technologies found."
        ),
        expected_output="An expanded and highly optimized array of keywords alongside the summary.",
        agent=enhancer_agent
    )

    judge_task = Task(
        description=(
            "Review the finalized repository summary and metadata.\n"
            "Determine if this project is highly technical and authored primarily by the candidate.\n"
            "If it appears to simply be an automatic fork of a massive open source project just for a patch PR, "
            "or if it lacks functional code, you must set is_valid to False.\n"
            "Otherwise, set is_valid to True. Compile everything into the final JSON response."
        ),
        expected_output="A JSON object matching the RepoAnalysisResult schema containing all fields, sorted cleanly.",
        agent=judge_agent,
        output_pydantic=RepoAnalysisResult
    )

    return Crew(
        agents=[inspector_agent, enhancer_agent, judge_agent],
        tasks=[inspect_task, enhance_task, judge_task]
    )
