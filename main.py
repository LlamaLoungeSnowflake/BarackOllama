import logging
logging.getLogger("LiteLLM").setLevel(logging.CRITICAL)

from dotenv import load_dotenv
load_dotenv()

import warnings
warnings.filterwarnings("ignore")

from barackollama.flows.resume_flow import kickoff_resume_flow
from barackollama.flows.linkedin_flow import kickoff_linkedin_flow

# Sample hardcoded data for testing the flow
sample_linkedin_url = "https://www.linkedin.com/in/csabatothdev/"
sample_repos = "- Django-Blog: A blog built with Django and Postgres\n- React-Dashboard: An admin dashboard in React"
sample_job_url = "https://www.linkedin.com/jobs/view/4377430140/"
sample_github_handle = "MrCsabaToth"

print(f"Scraping LinkedIn Profile for {sample_linkedin_url}...")
linkedin_json = kickoff_linkedin_flow(sample_linkedin_url)

print("Starting Custom Resume Flow...")
kickoff_resume_flow(linkedin_json, sample_repos, sample_job_url, sample_github_handle)
