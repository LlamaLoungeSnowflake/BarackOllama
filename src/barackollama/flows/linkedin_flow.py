from pydantic import BaseModel
from crewai.flow.flow import Flow, listen, start
from barackollama.crews.linkedin_crew import create_linkedin_crew, LinkedInProfileResult

class LinkedInFlowState(BaseModel):
    linkedin_url: str = ""
    profile_json: str = ""

class LinkedInFlow(Flow[LinkedInFlowState]):
    """
    A prequel flow that orchestrates scraping a complete LinkedIn profile
    to be used as dynamic context for the main Resume Flow.
    """
    
    @start()
    def scrape_profile(self):
        import os
        import json
        import re
        
        # Extract username from URL for a stable cache filename
        # e.g., https://www.linkedin.com/in/john-doe/ -> john-doe
        match = re.search(r'linkedin\.com/in/([^/]+)', self.state.linkedin_url)
        username = match.group(1) if match else "unknown_profile"
        
        cache_dir = os.path.join("output", "cache")
        cache_file = os.path.join(cache_dir, f"linkedin_{username}.json")
        
        try:
            os.makedirs(cache_dir, exist_ok=True)
        except Exception as e:
            print(f"Warning: Could not create cache directory for LinkedIn profile ({e}). Caching disabled.")
            
        if os.path.exists(cache_file):
            print(f"Cache hit for LinkedIn Profile: {username}. Loading from {cache_file}...")
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    self.state.profile_json = json.load(f).get("profile_json", "")
                    return self.state.profile_json
            except Exception as e:
                print(f"Failed to read cache for {username}: {e}. Retrying scrape...")

        print(f"Scraping LinkedIn Profile seamlessly from: {self.state.linkedin_url}")
        
        linkedin_crew = create_linkedin_crew()
        result = linkedin_crew.kickoff(inputs={
            "linkedin_url": self.state.linkedin_url
        })
        
        try:
            profile_output = result.pydantic
            if profile_output:
                self.state.profile_json = profile_output.profile_json
            else:
                self.state.profile_json = result.raw
                
            # Write to cache
            try:
                with open(cache_file, "w", encoding="utf-8") as f:
                    json.dump({"profile_json": self.state.profile_json}, f, indent=4)
            except Exception as write_e:
                print(f"Warning (Non-Fatal): Failed to write LinkedIn cache for {username}: {write_e}")
                
        except Exception as e:
            print(f"LinkedIn Flow extraction warning: {e}")
            self.state.profile_json = result.raw
            
        return self.state.profile_json

def kickoff_linkedin_flow(url: str) -> str:
    flow = LinkedInFlow()
    flow.state.linkedin_url = url
    return flow.kickoff()
