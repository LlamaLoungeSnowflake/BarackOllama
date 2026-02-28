'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownTabProps {
  markdown: string
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function MarkdownTab({ markdown }: MarkdownTabProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Copy Markdown'}
        </button>
        <button
          onClick={() => downloadBlob(markdown, 'README.md', 'text/markdown')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ⬇ Download README.md
        </button>
      </div>

      {/* Rendered markdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <article className="prose prose-sm max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
