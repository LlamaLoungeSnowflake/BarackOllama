import logging
logging.getLogger("LiteLLM").setLevel(logging.CRITICAL)

import warnings
warnings.filterwarnings("ignore")

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from barackollama.flows.linkedin_flow import kickoff_linkedin_flow
from barackollama.flows.github_scrape_flow import kickoff_github_scrape_flow
from barackollama.flows.resume_flow import kickoff_resume_flow

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from typing import List, Optional, Any, Dict
from copilotkit import CopilotKitSDK, Action
from copilotkit.agent import Agent as CopilotAgent
from copilotkit.types import Message, TextMessage
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from barackollama.crews.tools_crew import create_chat_crew

class CrewAIAgent(CopilotAgent):
    def __init__(self, name: str, description: str, crew: Any):
        super().__init__(name=name, description=description)
        self.crew = crew

    async def execute(
        self,
        *,
        state: dict,
        messages: List[Message],
        thread_id: Optional[str] = None,
        node_name: Optional[str] = None,
        actions: Optional[List[Dict[str, Any]]] = None,
    ):
        """Execute the CrewAI flow based on the latest message."""
        # Get the latest user message
        user_message_text = ""
        for msg in reversed(messages):
            if isinstance(msg, TextMessage) and msg.role == "user":
                user_message_text = msg.content
                break

        # If there's no message, just return current state
        if not user_message_text:
            return

        # We append the user's message as input so the agent context receives it.
        try:
            result = self.crew.kickoff(inputs={"user_message": user_message_text})
            
            # Create the assistant text response
            yield TextMessage(
                id="crewai-response",
                role="assistant",
                content=result.raw
            )
        except Exception as e:
            yield TextMessage(
                id="crewai-error",
                role="assistant",
                content=f"An error occurred: {str(e)}"
            )

# Create the top-level chat crew
my_crew = create_chat_crew()

# Create the CopilotKit Agent wrapping the Crew
my_agent = CrewAIAgent(
    name="default",
    crew=my_crew,
    description="Barack Ollama Career Portfolio Architect"
)

# Create CopilotKit SDK with the Agent
sdk = CopilotKitSDK(agents=[my_agent])

add_fastapi_endpoint(app, sdk, "/copilotkit")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
