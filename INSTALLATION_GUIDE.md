# BarackOllama Installation & Deployment Guide

This guide covers how to set up the BarackOllama Custom Resume CrewAI Flow locally, as well as how to deploy it to CrewAI Enterprise.

## Prerequisites
1. Python 3.12+
2. [uv](https://github.com/astral-sh/uv) package manager installed
3. API Keys for:
   - **OpenRouter** (for the LLM)
   - **Composio** (for GitHub deployment automation)
   - **BrightData** (for LinkedIn job scraping)

## Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LlamaLoungeSnowflake/BarackOllama.git
   cd BarackOllama
   ```

2. **Set up your environment variables:**
   Copy the example environment file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure:
   - `OPENROUTER_API_KEY`
   - `COMPOSIO_API_KEY`
   - `BRIGHTDATA_API_TOKEN` & `BRIGHTDATA_JOB_DATASET_ID`
   - _Optional:_ `OPENROUTER_MODEL` (Defaults to `openrouter/minimax/minimax-m2.5`)

3. **Install system dependencies (macOS):**
   WeasyPrint (used for PDF generation) requires Pango and GLib system libraries. Install them via Homebrew:
   ```bash
   brew install pango
   ```
   > **Note:** Without this, you will see an `OSError: cannot load library 'libgobject-2.0-0'` error when running the flow. Then run with the library path set:
   > ```bash
   > DYLD_LIBRARY_PATH=/opt/homebrew/lib:$DYLD_LIBRARY_PATH uv run main.py
   > ```

4. **Install dependencies:**
   Using `uv`, sync the dependencies to create your virtual environment.
   ```bash
   uv sync
   ```

5. **Run the flow locally:**
   The primary entry point is `main.py`, which triggers the `ResumeFlow`.
   ```bash
   DYLD_LIBRARY_PATH=/opt/homebrew/lib:$DYLD_LIBRARY_PATH uv run main.py
   ```

---

## Deploying to CrewAI Enterprise

Because this project is built using CrewAI's modern `Flow` architecture and relies on structured Pydantic inputs, it can be deployed directly to the CrewAI Enterprise cloud.

1. **Authenticate with CrewAI:**
   Login to your CrewAI Enterprise account via the CLI.
   ```bash
   uv run crewai login
   ```
   This will open a browser window for authentication.

2. **Create a new Deployment Project:**
   Provision a new cloud environment for the project.
   ```bash
   uv run crewai deploy create
   ```
   * The CLI will prompt you to confirm your environment variables (e.g., `OPENROUTER_API_KEY`, etc.) so they are mapped securely as secrets in the cloud.
   * It will ask you to confirm your connected GitHub repository.
   * Once finished, it will output a **UUID** for your deployment (e.g., `757c26b7-d4b4-42e4-9c4d-85fc7fbbbfdb`).

3. **Deploy the Code:**
   Push your local code up to the CrewAI cloud execution environment using the UUID generated in the previous step.
   ```bash
   uv run crewai deploy push --uuid <YOUR-UUID>
   ```

4. **Check Status:**
   You can monitor the status of your deployment via the CLI:
   ```bash
   uv run crewai deploy status --uuid <YOUR-UUID>
   ```

Once deployed successfully, your Custom Resume Flow will be available to trigger via the CrewAI Cloud Dashboard or their remote execution APIs.
