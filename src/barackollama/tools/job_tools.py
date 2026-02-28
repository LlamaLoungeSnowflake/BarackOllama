import json
from crewai.tools import tool
from barackollama.tools.get_job_listing import get_job_listing

@tool("Fetch Job Listing Details")
def fetch_job_listing_details(job_url: str) -> str:
    """
    Fetches the details of a LinkedIn job listing based on the URL using the BrightData API.
    Use this tool to extract information such as job_title, company_name, job_summary,
    job_description_formatted, etc. from a job listing URL.
    Returns a JSON string of the job details, or an empty dict if the job couldn't be fetched.
    """
    try:
        job_data = get_job_listing(job_url)
        return json.dumps(job_data, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)})

