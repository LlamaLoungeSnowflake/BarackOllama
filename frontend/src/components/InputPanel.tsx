'use client'

import { useState, useEffect } from 'react'
import { useIndexedDB } from '@/hooks/useIndexedDB'

interface InputPanelProps {
  onSubmit: (params: {
    githubUrl: string
    linkedinUrl: string
    jobUrl: string
    cachedLinkedin?: object | null
    cachedGithub?: string | null
  }) => void
  isGenerating: boolean
}

export default function InputPanel({ onSubmit, isGenerating }: InputPanelProps) {
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [cachedData, setCachedData] = useState<{ linkedin: object | null; github: string | null } | null>(null)
  const [useCached, setUseCached] = useState(false)

  const { loadCachedData, clearCache } = useIndexedDB()

  useEffect(() => {
    loadCachedData().then(setCachedData).catch(console.error)
  }, [loadCachedData])

  const hasCached = cachedData && (cachedData.linkedin || cachedData.github)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!githubUrl.trim() || !linkedinUrl.trim() || !jobUrl.trim()) return

    onSubmit({
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      jobUrl: jobUrl.trim(),
      cachedLinkedin: useCached ? cachedData?.linkedin : null,
      cachedGithub: useCached ? cachedData?.github : null,
    })
  }

  const handleClearCache = async () => {
    await clearCache()
    setCachedData(null)
    setUseCached(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Your Resume</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* GitHub URL */}
        <div>
          <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 mb-1">
            GitHub Profile URL
          </label>
          <input
            id="github-url"
            type="url"
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            disabled={isGenerating}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Profile URL
          </label>
          <input
            id="linkedin-url"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            disabled={isGenerating}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Job Posting URL */}
        <div>
          <label htmlFor="job-url" className="block text-sm font-medium text-gray-700 mb-1">
            Job Posting URL
          </label>
          <input
            id="job-url"
            type="url"
            placeholder="https://linkedin.com/jobs/view/..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            disabled={isGenerating}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* IndexedDB cache section */}
        {hasCached && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
            <p className="text-xs font-medium text-blue-800">📦 Cached data available</p>
            <div className="flex items-center gap-2">
              <input
                id="use-cached"
                type="checkbox"
                checked={useCached}
                onChange={(e) => setUseCached(e.target.checked)}
                disabled={isGenerating}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="use-cached" className="text-xs text-blue-700">
                Use cached LinkedIn/GitHub data (skip re-scraping)
              </label>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={isGenerating}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Clear cache
            </button>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isGenerating || !githubUrl.trim() || !linkedinUrl.trim() || !jobUrl.trim()}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            'Generate Resume →'
          )}
        </button>
      </form>
    </div>
  )
}
