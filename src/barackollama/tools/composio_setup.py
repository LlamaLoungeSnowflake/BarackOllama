from composio_crewai import CrewAIProvider
from composio import Composio

def get_github_tools():
    composio = Composio(provider=CrewAIProvider())
    session = composio.create(
        user_id="Shreyas-Yadav",
        toolkits=["github"]
    )
    tools = session.tools()
    connection_request = session.authorize("github")
    print(f"Open this URL to authenticate: {connection_request.redirect_url}")
    return tools
