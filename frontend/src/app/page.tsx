'use client'

import { useEffect, useRef } from 'react'
import { useResumeAgent } from '@/hooks/useResumeAgent'
import ChatMessage from '@/components/ChatMessage'
import TypingIndicator from '@/components/TypingIndicator'
import ChatInput from '@/components/ChatInput'

export default function HomePage() {
  const { messages, conversationState, isTyping, sendMessage } = useResumeAgent()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm">
            🤖
          </div>
          <div>
            <div className="font-semibold text-gray-900">Barack Ollama</div>
            <div className="text-xs text-gray-500">AI Resume Generator</div>
          </div>
        </div>
      </header>

      {/* Scrollable messages */}
      <main className="flex-1 overflow-y-auto pt-20 pb-24">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Fixed chat input */}
      <ChatInput
        onSend={sendMessage}
        isDisabled={conversationState === 'generating'}
      />
    </div>
  )
}
