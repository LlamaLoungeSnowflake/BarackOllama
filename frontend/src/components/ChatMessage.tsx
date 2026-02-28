'use client'

import type { ChatMessage as ChatMessageType } from '@/hooks/useResumeAgent'
import AgentProgressLog from './AgentProgressLog'
import OutputTabs from './OutputTabs'
import TypingIndicator from './TypingIndicator'

interface ChatMessageProps {
  message: ChatMessageType
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%]">
          <div className="bg-gray-900 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
            {message.content}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base leading-none">
        🤖
      </div>
      <div className="max-w-[85%]">
        <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
          {message.type === 'typing' && <TypingIndicator />}
          {message.type === 'text' && message.content}
          {message.type === 'progress' && message.steps && (
            <AgentProgressLog steps={message.steps} isRunning={message.isRunning ?? false} />
          )}
          {message.type === 'output' && message.output && (
            <div className="w-full min-w-[520px]">
              <p className="font-medium mb-3">✅ Done! Here&apos;s everything I generated for you:</p>
              <OutputTabs output={message.output} isGenerating={false} />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  )
}
