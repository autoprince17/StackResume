'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Uncaught error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          An unexpected error occurred. Please try again, or contact support if the problem persists.
        </p>
        {error.digest && (
          <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '1rem' }}>
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 1.5rem',
            backgroundColor: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
