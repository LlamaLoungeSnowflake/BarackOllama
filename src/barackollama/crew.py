from crewai import Crew
from barackollama.agents.github_agent import github_agent
from barackollama.tasks.github_tasks import github_task

crew = Crew(agents=[github_agent], tasks=[github_task])
