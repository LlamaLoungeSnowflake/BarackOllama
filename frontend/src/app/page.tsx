'use client'

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Barack Ollama</h1>
        <p className="text-gray-500">
          Your AI Career Portfolio Architect
        </p>
      </div>

      <div className="max-w-xl text-center text-sm text-gray-600 mb-8 px-4">
        <p>
          I can analyze your LinkedIn profile, review your GitHub repositories,
          and automatically generate a customized resume, portfolio, and README
          tailored to specific job postings.
        </p>
        <p className="mt-4 font-semibold">
          Click the chat button in the bottom right to begin!
        </p>
      </div>

      {/* 
        Wrap CopilotKit here or at the root layout. 
        We are doing it here specifically for the homepage chat experience 
      */}
      <CopilotKit runtimeUrl="/api/copilotkit">
        <CopilotPopup
          instructions="You are Barack Ollama, a career portfolio assistant. Greet the user, ask for their linkedin/github/job URLs, and use your tools to generate assets."
          labels={{
            title: "Barack Ollama Chat",
            initial: "Hello! Provide your LinkedIn URL, GitHub handle, and a job posting URL you want to tailor for, and I'll get to work!",
          }}
          defaultOpen={true}
        />
      </CopilotKit>
    </div>
  )
}
