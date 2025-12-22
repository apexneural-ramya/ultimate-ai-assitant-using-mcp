'use client'

import { useState } from 'react'
import Loader from '@/components/Loader'

interface MCPConfigSidebarProps {
  onConfigActivated: (sessionId: string) => void
  onConfigCleared: () => void
  isActive: boolean
}

export default function MCPConfigSidebar({
  onConfigActivated,
  onConfigCleared,
  isActive,
}: MCPConfigSidebarProps) {
  const [configText, setConfigText] = useState('')
  const [exampleConfig, setExampleConfig] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const defaultConfig = {
    mcpServers: {
      'mcp-server-firecrawl': {
        command: 'npx',
        args: ['-y', 'firecrawl-mcp'],
        env: {
          FIRECRAWL_API_KEY: '${FIRECRAWL_API_KEY}',
        },
      },
      ragie: {
        command: 'npx',
        args: ['-y', '@ragieai/mcp-server', '--partition', 'default'],
        env: {
          RAGIE_API_KEY: '${RAGIE_API_KEY}',
        },
      },
    },
  }

  const handleLoadExample = () => {
    setExampleConfig(JSON.stringify(defaultConfig, null, 2))
    setConfigText(JSON.stringify(defaultConfig, null, 2))
  }

  const handleActivate = async () => {
    if (!configText.trim()) {
      setError('Please enter a configuration first')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const config = JSON.parse(configText)
      const sessionId = `session-${Date.now()}`

      const response = await fetch('/api/mcp/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, sessionId }),
      })

      // Handle network errors
      if (!response.ok) {
        let errorMessage = 'Failed to activate configuration'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.status || !response.ok) {
        throw new Error(data.message || 'Failed to activate configuration')
      }

      setSuccess('✅ Configuration activated successfully!')
      onConfigActivated(data.data?.sessionId || data.sessionId)
    } catch (err: any) {
      // Provide more helpful error messages
      let errorMessage = err.message || 'Invalid JSON configuration'
      
      if (err.message?.includes('JSON') || err.message?.includes('parse')) {
        errorMessage = 'Invalid JSON format. Please check your configuration syntax.'
      } else if (err.message?.includes('connect') || err.message?.includes('backend')) {
        errorMessage = err.message
      } else if (!err.message) {
        errorMessage = 'Network error: Could not reach the backend server. Make sure it is running on port 8000.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setConfigText('')
    setExampleConfig(null)
    setError(null)
    setSuccess(null)
    onConfigCleared()
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '460px',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '640px',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 600 }}>
          MCP Configuration
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Enter MCP Configuration (JSON)
          </label>
          <textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder={JSON.stringify(defaultConfig, null, 2)}
            style={{
              width: '100%',
              height: '300px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleLoadExample}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Load Example Config
          </button>

          {exampleConfig && (
            <textarea
              value={exampleConfig}
              readOnly
              style={{
                width: '100%',
                height: '150px',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                backgroundColor: '#f5f5f5',
                marginBottom: '0.5rem',
              }}
            />
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleActivate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: loading ? '#ccc' : '#0070f3',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading && <Loader size="small" />}
            {loading ? 'Activating...' : 'Activate Configuration'}
          </button>

          <button
            onClick={handleClear}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Clear Chat & Config
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#efe',
              border: '1px solid #cfc',
              borderRadius: '4px',
              color: '#3c3',
              fontSize: '0.9rem',
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>
            Status
          </h3>
          {isActive ? (
            <>
              <div style={{ color: '#3c3', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                ✅ MCP Client Active
              </div>
              <div style={{ color: '#3c3', fontSize: '0.9rem' }}>✅ Agent Ready</div>
            </>
          ) : (
            <div style={{ color: '#f90', fontSize: '0.9rem' }}>
              ⚠️ Configuration not activated
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

