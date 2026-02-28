'use client'

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function openInNewTab(html: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

interface PortfolioTabProps {
  html: string
}

export default function PortfolioTab({ html }: PortfolioTabProps) {
  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => downloadBlob(html, 'portfolio.html', 'text/html')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ⬇ Download HTML
        </button>
        <button
          onClick={() => openInNewTab(html)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
        >
          🔗 Open in new tab
        </button>
      </div>

      {/* Portfolio iframe */}
      <iframe
        srcDoc={html}
        title="Portfolio Preview"
        sandbox="allow-scripts"
        className="w-full h-[600px] rounded-lg border border-gray-200"
      />
    </div>
  )
}
