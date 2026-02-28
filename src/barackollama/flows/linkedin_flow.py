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
        except Exception as e:
            print(f"LinkedIn Flow extraction warning: {e}")
            self.state.profile_json = result.raw
            
        return self.state.profile_json

def kickoff_linkedin_flow(url: str) -> str:
    flow = LinkedInFlow()
    flow.state.linkedin_url = url
    return flow.kickoff()
