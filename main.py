import logging
logging.getLogger("LiteLLM").setLevel(logging.CRITICAL)

from dotenv import load_dotenv
load_dotenv()

import warnings
warnings.filterwarnings("ignore")

from barackollama.flows.resume_flow import kickoff_resume_flow
from barackollama.flows.linkedin_flow import kickoff_linkedin_flow
from barackollama.flows.github_scrape_flow import kickoff_github_scrape_flow

# Sample hardcoded data for testing the flow
sample_linkedin_url = "https://www.linkedin.com/in/csabatothdev/"
sample_job_url = "https://www.linkedin.com/jobs/view/4377430140/"
sample_github_handle = "MrCsabaToth"

print(f"Scraping LinkedIn Profile for {sample_linkedin_url}...")
linkedin_json = kickoff_linkedin_flow(sample_linkedin_url)

print(f"Scraping and Analyzing all GitHub Repositories for {sample_github_handle}...")
# Note: You can optionally add GITHUB_TOKEN to .env before running this to avoid rate limits
comprehensive_repos_markdown = kickoff_github_scrape_flow(sample_github_handle)

print("Starting Custom Resume Flow...")
kickoff_resume_flow(linkedin_json, comprehensive_repos_markdown, sample_job_url, sample_github_handle)
