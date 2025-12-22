'use client'

import { useState, useRef, useEffect } from 'react'
import Loader from '@/components/Loader'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  sessionId: string | null
  isConfigActive: boolean
}

export default function ChatInterface({ sessionId, isConfigActive }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !sessionId) {
      if (!isConfigActive) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Please activate the MCP configuration first!',
          },
        ])
      }
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/mcp/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input, sessionId }),
      })

      const data = await response.json()

      if (!data.status || !response.ok) {
        throw new Error(data.message || 'Error processing request')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.data?.result || data.result },
      ])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          backgroundColor: '#fafafa',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              marginTop: '3rem',
            }}
          >
            Start a conversation by asking about your MCP tools...
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? '#0070f3' : '#fff',
                color: message.role === 'user' ? '#fff' : '#000',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Loader size="small" />
              <span>Processing your request...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          borderTop: '1px solid #e0e0e0',
          padding: '1.5rem 2rem',
          backgroundColor: 'white',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your MCP tools..."
              disabled={loading || !isConfigActive}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !isConfigActive || !input.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor:
                  loading || !isConfigActive || !input.trim() ? '#ccc' : '#0070f3',
                color: 'white',
                cursor:
                  loading || !isConfigActive || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div
        style={{
          borderTop: '1px solid #e0e0e0',
          padding: '1rem 2rem',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.85rem',
        }}
      >
        Built using mcp-use and Next.js
      </div>
    </div>
  )
}

