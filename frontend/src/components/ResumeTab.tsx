'use client'

import { useState } from 'react'

interface ResumeTabProps {
  latex: string
  pdfUrl?: string
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

export default function ResumeTab({ latex, pdfUrl }: ResumeTabProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(latex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="resume.pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ⬇ Download PDF
          </a>
        )}
        <button
          onClick={() => downloadBlob(latex, 'resume.tex', 'text/plain')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ⬇ Download .tex
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Copy LaTeX'}
        </button>
      </div>

      {/* PDF iframe */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          title="Resume PDF"
          className="w-full h-96 rounded-lg border border-gray-200"
        />
      )}

      {/* LaTeX source */}
      <div className="relative">
        <p className="text-xs font-medium text-gray-500 mb-1">LaTeX Source</p>
        <pre className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg overflow-auto max-h-96 scrollbar-thin whitespace-pre-wrap">
          {latex}
        </pre>
      </div>
    </div>
  )
}
