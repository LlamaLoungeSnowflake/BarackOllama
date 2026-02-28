'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { ResumeOutput } from '@/types/resume'
import ResumeTab from './ResumeTab'
import MarkdownTab from './MarkdownTab'
import PortfolioTab from './PortfolioTab'
import JobsTable from './JobsTable'
import SkillsTable from './SkillsTable'

const TABS = [
  { id: 'resume', label: '📄 Resume' },
  { id: 'markdown', label: '📝 GitHub MD' },
  { id: 'portfolio', label: '🌐 Portfolio' },
  { id: 'jobs', label: '🎯 Similar Jobs' },
] as const

type TabId = (typeof TABS)[number]['id']

interface OutputTabsProps {
  output: ResumeOutput | null
  isGenerating: boolean
}

export default function OutputTabs({ output, isGenerating }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resume')

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-r border-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {isGenerating && !output && (
          <div className="flex flex-col items-center justify-center h-full py-16 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Generating your resume…</p>
          </div>
        )}

        {!isGenerating && !output && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <p className="text-4xl mb-4">👈</p>
            <p className="text-gray-500 text-sm max-w-xs">
              Fill in your GitHub, LinkedIn, and job posting URLs on the left, then click{' '}
              <span className="font-medium text-gray-700">Generate Resume</span> to get started.
            </p>
          </div>
        )}

        {output && (
          <>
            {activeTab === 'resume' && (
              <ResumeTab latex={output.latex} pdfUrl={output.pdfUrl} />
            )}
            {activeTab === 'markdown' && (
              <MarkdownTab markdown={output.markdown} />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioTab html={output.webpageHtml} />
            )}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <JobsTable jobs={output.jobSuggestions} />
                <SkillsTable skills={output.skillsMatch} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
