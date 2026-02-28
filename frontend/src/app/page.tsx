'use client'

import { useEffect, useRef, useState } from 'react'
import { useResumeAgent } from '@/hooks/useResumeAgent'
import { useIndexedDB } from '@/hooks/useIndexedDB'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import TypingIndicator from '@/components/TypingIndicator'

export default function HomePage() {
  const { messages, conversationState, sendMessage, isTyping, reset } = useResumeAgent()
  const { hasCachedData, loadCachedData } = useIndexedDB()
  const [hasCached, setHasCached] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    hasCachedData().then(setHasCached).catch(() => setHasCached(false))
  }, [hasCachedData])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleUseCached = async () => {
    const data = await loadCachedData()
    if (data.github) {
      await sendMessage(data.github)
    }
    if (data.linkedin) {
      await sendMessage(String(data.linkedin))
    }
  }

  const isInputDisabled =
    isTyping ||
    conversationState === 'generating' ||
    conversationState === 'done' ||
    conversationState === 'greeting'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Barack Ollama</h1>
              <p className="text-xs text-gray-500 leading-tight">AI Resume Generator</p>
            </div>
          </div>
          {conversationState === 'done' && (
            <button
              onClick={reset}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      {/* Chat message list */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-20 pb-32">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2 mb-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base leading-none">
              🤖
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Fixed bottom input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isInputDisabled}
        hasCachedData={hasCached}
        onUseCached={handleUseCached}
      />
    </div>
  )
}

