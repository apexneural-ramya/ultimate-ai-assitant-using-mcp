'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import MCPConfigSidebar from '@/components/MCPConfigSidebar'
import Loader from '@/components/Loader'

export default function PlaygroundPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isConfigActive, setIsConfigActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate page loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loader fullScreen text="Loading playground..." />
  }

  return (
    <main className="page">
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <Link href="/" className="btn btn--ghost" style={{ marginBottom: '1rem' }}>
                ← Back to Home
              </Link>
              <p className="eyebrow">Live playground</p>
              <h2>Configure MCP and start chatting</h2>
              <p className="subtitle">
                Load the example config (Firecrawl + Ragie), activate, then chat — all without
                leaving this page.
              </p>
            </div>
            <div className="badge-group">
              <span className="pill pill--soft">Env-driven</span>
              <span className="pill pill--soft">Standardized responses</span>
              <span className="pill pill--soft">Swagger ready</span>
            </div>
          </div>

          <div className="playground">
            <div className="playground__panel">
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
            </div>
            <div className="playground__panel playground__panel--chat">
              <ChatInterface sessionId={sessionId} isConfigActive={isConfigActive} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

