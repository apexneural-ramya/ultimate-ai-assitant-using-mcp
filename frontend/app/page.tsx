'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import MCPConfigSidebar from '@/components/MCPConfigSidebar'

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isConfigActive, setIsConfigActive] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MCPConfigSidebar
        onConfigActivated={(id) => {
          setSessionId(id)
          setIsConfigActive(true)
        }}
        onConfigCleared={() => {
          setSessionId(null)
          setIsConfigActive(false)
        }}
        isActive={isConfigActive}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #e0e0e0' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            🤖 MCP-powered Ultimate AI Assistant
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
            Configure your MCP servers and chat with them using natural language!
          </p>
        </header>
        <ChatInterface sessionId={sessionId} isConfigActive={isConfigActive} />
      </div>
    </div>
  )
}

