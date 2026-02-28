import logging
logging.getLogger("LiteLLM").setLevel(logging.CRITICAL)

from dotenv import load_dotenv
load_dotenv()

from barackollama.flows.resume_flow import kickoff_resume_flow

# Sample hardcoded data for testing the flow
sample_linkedin = "I am an experienced Full Stack Developer specializing in React and Python..."
sample_repos = "- Django-Blog: A blog built with Django and Postgres\n- React-Dashboard: An admin dashboard in React"
sample_job_url = "https://www.linkedin.com/jobs/view/4377430140/"
sample_github_handle = "MrCsabaToth"

print("Starting Custom Resume Flow...")
kickoff_resume_flow(sample_linkedin, sample_repos, sample_job_url, sample_github_handle)

