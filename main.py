import logging
logging.getLogger("LiteLLM").setLevel(logging.CRITICAL)

from dotenv import load_dotenv
load_dotenv()

from barackollama.crew import crew

crew.kickoff()
