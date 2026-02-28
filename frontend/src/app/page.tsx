'use client'

import InputPanel from '@/components/InputPanel'
import AgentProgressLog from '@/components/AgentProgressLog'
import OutputTabs from '@/components/OutputTabs'
import { useResumeAgent } from '@/hooks/useResumeAgent'

export default function HomePage() {
  const { run, isRunning, agentSteps, output, reset } = useResumeAgent()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦙</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BarackOllama</h1>
              <p className="text-sm text-gray-500">AI-Powered Resume Generator</p>
            </div>
          </div>
          {output && (
            <button
              onClick={reset}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left panel — 40% */}
          <div className="w-full lg:w-2/5 space-y-4">
            <InputPanel onSubmit={run} isGenerating={isRunning} />
            {agentSteps.length > 0 && (
              <AgentProgressLog steps={agentSteps} isRunning={isRunning} />
            )}
          </div>

          {/* Right panel — 60% */}
          <div className="w-full lg:w-3/5">
            <OutputTabs output={output} isGenerating={isRunning} />
          </div>
        </div>
      </main>
    </div>
  )
}
