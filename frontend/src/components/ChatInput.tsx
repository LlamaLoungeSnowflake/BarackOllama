'use client'

import { useRef } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
  hasCachedData: boolean
  onUseCached: () => void
}

export default function ChatInput({ onSend, disabled, hasCachedData, onUseCached }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const value = inputRef.current?.value.trim()
    if (!value || disabled) return
    onSend(value)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
        {hasCachedData && (
          <button
            type="button"
            onClick={onUseCached}
            disabled={disabled}
            className="shrink-0 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-full px-3 py-1.5 whitespace-nowrap disabled:opacity-50"
          >
            📎 Use cached data
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={disabled ? 'Waiting…' : 'Type a message…'}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled}
          className="shrink-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label="Send"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
