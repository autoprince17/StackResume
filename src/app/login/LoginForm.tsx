'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { sendMagicLink, signInWithEmail } from '@/lib/auth'
import Link from 'next/link'

type LoginMode = 'student' | 'admin'

export function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('student')
  const [error, setError] = useState(searchParams.get('error') || '')

  // Student magic link state
  const [studentEmail, setStudentEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [studentLoading, setStudentLoading] = useState(false)

  // Admin password state
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  // Clear error when switching tabs
  useEffect(() => {
    setError('')
  }, [mode])

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStudentLoading(true)
    setError('')

    try {
      const result = await sendMagicLink(studentEmail)
      if (result.success) {
        setLinkSent(true)
      } else {
        setError(result.error || 'Failed to send sign-in link.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setStudentLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setError('')

    try {
      const result = await signInWithEmail(adminEmail, adminPassword)
      if (result.success) {
        router.push('/admin')
      } else {
        setError(result.error || 'Login failed.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setAdminLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            StackResume
          </Link>
          <p className="text-slate-600 mt-2">
            {mode === 'student'
              ? 'Sign in to view your portfolio dashboard'
              : 'Admin access'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => { setMode('student'); setLinkSent(false) }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              mode === 'student'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              mode === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Admin
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-6">
              {error}
            </div>
          )}

          {/* Student magic link flow */}
          {mode === 'student' && !linkSent && (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div>
                <label htmlFor="student-email" className="label">
                  Email Address
                </label>
                <input
                  id="student-email"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Use the same email you submitted your portfolio with.
                </p>
              </div>

              <button
                type="submit"
                disabled={studentLoading}
                className="btn btn-primary w-full"
              >
                {studentLoading ? 'Sending...' : 'Send Sign-in Link'}
              </button>
            </form>
          )}

          {/* Student: link sent confirmation */}
          {mode === 'student' && linkSent && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Check your email
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                We sent a sign-in link to <strong>{studentEmail}</strong>.
                Click the link in the email to access your dashboard.
              </p>
              <p className="text-xs text-slate-500 mb-4">
                The link expires in 1 hour. Check your spam folder if you do not see it.
              </p>
              <button
                type="button"
                onClick={() => { setLinkSent(false); setError('') }}
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* Admin password flow */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div>
                <label htmlFor="admin-email" className="label">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="admin@stackresume.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="label">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="btn btn-primary w-full"
              >
                {adminLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/" className="hover:text-slate-900 underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
