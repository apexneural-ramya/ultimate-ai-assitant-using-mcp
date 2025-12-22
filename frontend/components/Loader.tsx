'use client'

interface LoaderProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
}

export default function Loader({ size = 'medium', text, fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    small: '20px',
    medium: '40px',
    large: '60px',
  }

  const spinnerSize = sizeClasses[size]

  const spinner = (
    <div
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: `3px solid #f3f3f3`,
        borderTop: `3px solid #0070f3`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  )

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: '1rem',
        }}
      >
        {spinner}
        {text && (
          <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>{text}</p>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem',
      }}
    >
      {spinner}
      {text && (
        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{text}</p>
      )}
    </div>
  )
}

