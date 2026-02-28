'use client'

import type { ChatMsg } from '@/hooks/useResumeAgent'
import { AGENT_TOOL_LABELS } from '@/hooks/useResumeAgent'
import OutputTabs from './OutputTabs'
import TypingIndicator from './TypingIndicator'

const STATUS_ICONS: Record<string, string> = {
  running: '⏳',
  done: '✅',
  error: '❌',
}

interface ChatMessageProps {
  message: ChatMsg
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-gray-900 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-xs">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <div className="shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
        🤖
      </div>
      <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-2xl">
        {message.type === 'typing' && <TypingIndicator />}

        {message.type === 'text' && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}

        {message.type === 'progress' && (
          <div className="space-y-2 min-w-[220px]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Agent Progress
            </p>
            {(message.steps ?? []).map((step) => (
              <div key={step.tool} className="flex items-center gap-2 text-sm">
                <span>{STATUS_ICONS[step.status] ?? '⏳'}</span>
                <span className={step.status === 'done' ? 'text-gray-700' : 'text-gray-500'}>
                  {AGENT_TOOL_LABELS[step.tool] ?? step.tool}
                </span>
              </div>
            ))}
            {(message.steps ?? []).length === 0 && (
              <p className="text-xs text-gray-400 italic">Starting…</p>
            )}
          </div>
        )}

        {message.type === 'output' && message.output && (
          <div className="w-full min-w-[min(600px,80vw)]">
            <OutputTabs output={message.output} isGenerating={false} />
          </div>
        )}
      </div>
    </div>
  )
}
