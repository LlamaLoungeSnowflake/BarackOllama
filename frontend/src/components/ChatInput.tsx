'use client'

import { useState } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  isDisabled: boolean
  onUseCached?: () => void
}

export default function ChatInput({ onSend, isDisabled, onUseCached }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (!value.trim() || isDisabled) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2">
        {onUseCached && (
          <button
            onClick={onUseCached}
            disabled={isDisabled}
            className="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            💾 Use cached
          </button>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || !value.trim()}
          className="shrink-0 w-9 h-9 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label="Send"
        >
          →
        </button>
      </div>
    </div>
  )
}
