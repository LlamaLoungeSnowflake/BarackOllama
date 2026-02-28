'use client'

import { useEffect, useRef } from 'react'
import type { AgentStep } from '@/types/resume'
import clsx from 'clsx'

const TOOL_LABELS: Record<string, string> = {
  brightdata_linkedin: '🔍 Scraping LinkedIn profile',
  composio_github: '📦 Reading GitHub repositories',
  crewai_extract: '🧠 Extracting relevant data',
  pydantic_validate: '✅ Validating structured data',
  latex_generate: '📄 Generating LaTeX resume',
  pdf_compile: '🖨️ Compiling PDF',
  keyword_hitl: '🤝 HITL: Confirming keywords',
  portfolio_generate: '🌐 Building portfolio page',
  job_search: '🎯 Finding similar jobs',
}

const STATUS_ICONS: Record<AgentStep['status'], string> = {
  pending: '⏳',
  running: '⚙️',
  done: '✅',
  error: '❌',
}

interface AgentProgressLogProps {
  steps: AgentStep[]
  isRunning: boolean
}

export default function AgentProgressLog({ steps, isRunning }: AgentProgressLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        {isRunning && (
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
        Agent Progress
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {steps.map((step) => (
          <div
            key={step.id}
            className={clsx(
              'flex items-start gap-2 text-sm animate-fade-in rounded-lg px-2 py-1.5',
              step.status === 'done' && 'bg-green-50',
              step.status === 'running' && 'bg-blue-50',
              step.status === 'error' && 'bg-red-50',
              step.status === 'pending' && 'bg-gray-50',
            )}
          >
            <span className="shrink-0 text-base leading-5">{STATUS_ICONS[step.status]}</span>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {TOOL_LABELS[step.tool] ?? step.tool}
              </p>
              {step.message && (
                <p className="text-xs text-gray-500 mt-0.5">{step.message}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
