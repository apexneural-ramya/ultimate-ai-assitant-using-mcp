'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

export default function Home() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handlePlaygroundClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsNavigating(true)
    router.push('/playground')
  }
  const featureCards = [
    {
      title: 'MCP-native',
      desc: 'Built for Model Context Protocol with Firecrawl + Ragie servers.',
    },
    {
      title: 'Config-driven',
      desc: 'Drop in your JSON, auto-resolves env vars, and spins up sessions.',
    },
    {
      title: 'FastAPI + Next.js',
      desc: 'Typed APIs, standardized responses, modern React UI.',
    },
    {
      title: 'Secure by default',
      desc: 'No hardcoded URLs/ports. Everything comes from .env files.',
    },
  ]

  const steps = [
    'Set API keys in .env and frontend/.env.local',
    'Load example MCP config (Firecrawl + Ragie) or paste your own',
    'Activate configuration to start an MCP session',
    'Chat with the agent — tools are picked automatically',
  ]

  return (
    <main className="page">
      {isNavigating && <Loader fullScreen text="Loading playground..." />}
      <section className="hero">
        <div className="container hero__content">
          <div className="pill">MCP • FastAPI • Next.js</div>
          <h1>Ultimate MCP AI Assistant</h1>
          <p className="subtitle">
            Spin up Firecrawl + Ragie MCP servers, activate configs, and chat through a modern
            Next.js interface powered by a FastAPI backend.
          </p>
          <div className="hero__actions">
            <Link 
              className="btn btn--primary" 
              href="/playground"
              onClick={handlePlaygroundClick}
              style={{ pointerEvents: isNavigating ? 'none' : 'auto', opacity: isNavigating ? 0.7 : 1 }}
            >
              {isNavigating ? 'Loading...' : 'Launch Live Playground'}
            </Link>
            <a className="btn btn--ghost" href="#how-it-works">
              See how it works
            </a>
          </div>
          <div className="hero__grid">
            <div className="hero__card">
              <span className="label">Servers</span>
              <strong>Firecrawl + Ragie</strong>
              <p>Pre-wired MCP config with env placeholders</p>
            </div>
            <div className="hero__card">
              <span className="label">LLM</span>
              <strong>OpenRouter / OpenAI</strong>
              <p>Configurable via env + standardized responses</p>
            </div>
            <div className="hero__card">
              <span className="label">API</span>
              <strong>FastAPI</strong>
              <p>Swagger docs, health check, CORS ready</p>
            </div>
            <div className="hero__card">
              <span className="label">Frontend</span>
              <strong>Next.js 14</strong>
              <p>App Router, TypeScript, live MCP controls</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="eyebrow">Why this stack</p>
              <h2>Ready for production, focused on MCP</h2>
              <p className="subtitle">
                Opinionated defaults, clear env-driven config, and a smooth onboarding flow for MCP
                tools.
              </p>
            </div>
          </div>
          <div className="feature-grid">
            {featureCards.map((card) => (
              <div key={card.title} className="feature-card">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="eyebrow">How it works</p>
              <h2>From env to chat in minutes</h2>
              <p className="subtitle">Follow the flow and you're chatting with MCP tools quickly.</p>
            </div>
          </div>
          <div className="steps">
            {steps.map((step, idx) => (
              <div key={step} className="step">
                <div className="step__badge">{idx + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cta">
        <div className="container cta">
          <div>
            <p className="eyebrow">Ready to ship</p>
            <h2>Run locally, deploy anywhere.</h2>
            <p className="subtitle">
              Keep secrets in env files, start both servers, and you're live. No hardcoded URLs or
              ports.
            </p>
          </div>
          <div className="cta__actions">
            <Link 
              className="btn btn--primary" 
              href="/playground"
              onClick={handlePlaygroundClick}
              style={{ pointerEvents: isNavigating ? 'none' : 'auto', opacity: isNavigating ? 0.7 : 1 }}
            >
              {isNavigating ? 'Loading...' : 'Try the playground'}
            </Link>
            <a className="btn btn--ghost" href="#how-it-works">
              View setup steps
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
