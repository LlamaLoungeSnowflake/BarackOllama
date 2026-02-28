import json
from crewai.tools import tool
from barackollama.tools.get_linkedin_profile import get_linkedin_profile

@tool("Fetch LinkedIn Profile Details")
def fetch_linkedin_profile_details(profile_url: str) -> str:
    """
    Scrapes a user's comprehensive LinkedIn profile using the BrightData API.
    
    Args:
        profile_url: The full LinkedIn URL (e.g., https://www.linkedin.com/in/csabatothdev/)

    Returns:
        A JSON string containing the extracted career history, education, skills, and projects.
    """
    try:
        profile_data = get_linkedin_profile(profile_url)
        return json.dumps(profile_data, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error fetching LinkedIn profile: {str(e)}"
