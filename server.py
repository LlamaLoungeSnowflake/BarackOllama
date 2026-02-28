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


class LinkedInPreprocessRequest(BaseModel):
    linkedin_url: str


class GitHubPreprocessRequest(BaseModel):
    github_handle: str


class GenerateRequest(BaseModel):
    linkedin_json: str
    repos_markdown: str
    job_url: str
    github_handle: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/preprocess/linkedin")
def preprocess_linkedin(request: LinkedInPreprocessRequest):
    try:
        result = kickoff_linkedin_flow(request.linkedin_url)
        return {"profile_json": str(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preprocess/github")
def preprocess_github(request: GitHubPreprocessRequest):
    try:
        result = kickoff_github_scrape_flow(request.github_handle)
        return {"repos_markdown": str(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate")
def generate(request: GenerateRequest):
    try:
        result = kickoff_resume_flow(
            request.linkedin_json,
            request.repos_markdown,
            request.job_url,
            request.github_handle,
        )
        return {"status": "ok", "result": str(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
