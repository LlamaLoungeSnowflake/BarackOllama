import os
from crewai import Agent, LLM
from barackollama.tools.composio_setup import tools

llm = LLM(
    model="openrouter/deepseek/deepseek-r1",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

github_agent = Agent(
    role="GitHub Agent",
    goal="You take action on GitHub using GitHub APIs",
    backstory="You are AI agent that is responsible for taking actions on GitHub on behalf of users using GitHub APIs",
    verbose=True,
    tools=tools,
    llm=llm
)
