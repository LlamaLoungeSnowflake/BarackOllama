import os
from crewai import Agent, Task, Crew, LLM
from barackollama.tools.composio_setup import get_github_tools

def create_github_crew() -> Crew:
    """
    Creates and returns the GitHub Crew instance.
    """
    llm = LLM(
        model="openrouter/deepseek/deepseek-r1",
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    
    github_agent = Agent(
        role="GitHub Agent",
        goal="You take action on GitHub using GitHub APIs",
        backstory="You are an AI agent that is responsible for taking actions on GitHub on behalf of users using GitHub APIs",
        verbose=True,
        tools=get_github_tools(),
        llm=llm
    )
    
    github_task = Task(
        description="Star a repo Shreyas-Yadav/mockmind on GitHub",
        agent=github_agent,
        expected_output="Status of the operation",
    )
    
    return Crew(
        agents=[github_agent],
        tasks=[github_task]
    )
