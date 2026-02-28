import logging
logging.getLogger("LiteLLM").setLevel(logging.CRITICAL)

from dotenv import load_dotenv
load_dotenv()

from barackollama.crews.github_crew import create_github_crew

crew = create_github_crew()
crew.kickoff()
