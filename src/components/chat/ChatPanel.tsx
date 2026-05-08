import React, { useRef, useEffect } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { MessageSquare } from 'lucide-react'

interface ChatPanelProps {
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  streamingText?: string
}

export function ChatPanel({ onSendMessage, isProcessing = false, streamingText }: ChatPanelProps) {
  const { messages } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Trip Assistant</h2>
          <p className="text-sm text-gray-500">Ask me anything about your trip</p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 max-w-sm">
              Ask me to modify your itinerary, suggest alternatives, or answer questions about your trip.
            </p>
            <div className="mt-6 space-y-2 w-full max-w-sm">
              <button
                onClick={() => onSendMessage('Add more museums to my itinerary')}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
              >
                💡 Add more museums to my itinerary
              </button>
              <button
                onClick={() => onSendMessage('Find vegetarian restaurants near my hotel')}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
              >
                🍽️ Find vegetarian restaurants near my hotel
              </button>
              <button
                onClick={() => onSendMessage('What should I pack for this trip?')}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
              >
                🎒 What should I pack for this trip?
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingText && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingText,
              timestamp: new Date().toISOString(),
            }}
            isStreaming={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isProcessing}
        placeholder={isProcessing ? 'Processing...' : 'Ask me anything about your trip...'}
      />
    </div>
  )
}

// Made with Bob
