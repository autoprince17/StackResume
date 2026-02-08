'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Clock, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'

export default function StudentDashboardPage() {
  const [email, setEmail] = useState('')
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookupStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/student?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setStudentData(data)
      }
    } catch {
      setError('Failed to lookup student')
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'deployed':
        return {
          icon: <Check className="w-6 h-6 text-green-600" />,
          text: 'Live',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'approved':
        return {
          icon: <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />,
          text: 'Building',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'submitted':
        return {
          icon: <Clock className="w-6 h-6 text-amber-600" />,
          text: 'In Review',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          text: 'Issue',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
      default:
        return {
          icon: <Clock className="w-6 h-6 text-slate-600" />,
          text: status,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50'
        }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Student Dashboard
          </h1>
          <p className="text-slate-600">
            Check the status of your portfolio
          </p>
        </div>

        {!studentData ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-md mx-auto">
            <form onSubmit={lookupStudent} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Looking up...' : 'View Status'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {studentData.student.name}
                  </h2>
                  <p className="text-slate-600">{studentData.student.email}</p>
                </div>
                <button
                  onClick={() => setStudentData(null)}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Look up different email
                </button>
              </div>

              <div className={`p-6 rounded-lg ${getStatusDisplay(studentData.student.status).bgColor}`}>
                <div className="flex items-center gap-4">
                  {getStatusDisplay(studentData.student.status).icon}
                  <div>
                    <p className={`font-semibold ${getStatusDisplay(studentData.student.status).color}`}>
                      {getStatusDisplay(studentData.student.status).text}
                    </p>
                    <p className="text-sm text-slate-600">
                      {studentData.student.status === 'deployed' 
                        ? 'Your portfolio is live and ready to share'
                        : studentData.student.status === 'approved'
                        ? 'Your portfolio is being built'
                        : 'We are reviewing your submission'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {studentData.student.status === 'deployed' && (
                <div className="mt-6">
                  <a
                    href={`https://${studentData.student.subdomain}.stackresume.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    View Your Portfolio
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tier</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {studentData.student.tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Submitted</span>
                  <span className="font-medium text-slate-900">
                    {new Date(studentData.student.created_at).toLocaleDateString()}
                  </span>
                </div>
                {studentData.student.subdomain && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Your URL</span>
                    <span className="font-medium text-slate-900">
                      {studentData.student.subdomain}.stackresume.com
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Questions?{' '}
                <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
