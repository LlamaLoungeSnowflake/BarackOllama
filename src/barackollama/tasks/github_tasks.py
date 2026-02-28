from crewai import Task
from barackollama.agents.github_agent import github_agent

github_task = Task(
    description="Star a repo Shreyas-Yadav/mockmind on GitHub",
    agent=github_agent,
    expected_output="Status of the operation",
)
