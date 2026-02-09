'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Clock, AlertCircle, ExternalLink, Loader2, FileEdit, Repeat, Paintbrush, Link2, Send } from 'lucide-react'

type ChangeRequestType = 'content_edit' | 'template_swap' | 'redesign' | 'link_update'

const changeTypes: { value: ChangeRequestType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'content_edit', label: 'Content Edit', description: 'Fix typos, update text, change descriptions', icon: <FileEdit className="w-4 h-4" /> },
  { value: 'link_update', label: 'Link Update', description: 'Update GitHub, LinkedIn, or project URLs', icon: <Link2 className="w-4 h-4" /> },
  { value: 'template_swap', label: 'Template Swap', description: 'Switch to a different template design', icon: <Repeat className="w-4 h-4" /> },
  { value: 'redesign', label: 'Redesign', description: 'Full design overhaul with new layout', icon: <Paintbrush className="w-4 h-4" /> },
]

function ChangeRequestForm({ studentId, onSubmitted }: { studentId: string; onSubmitted: () => void }) {
  const [type, setType] = useState<ChangeRequestType>('content_edit')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, type, description }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
        setDescription('')
        onSubmitted()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Request Type</label>
        <div className="grid grid-cols-2 gap-2">
          {changeTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setType(ct.value)}
              className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                type === ct.value
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {ct.icon}
                <span className="font-medium text-slate-900">{ct.label}</span>
              </div>
              <p className="text-xs text-slate-500">{ct.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[100px]"
          placeholder="Describe what you want changed..."
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">Change request submitted. We will review it shortly.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !description.trim()}
        className="btn btn-primary w-full"
      >
        {submitting ? (
          'Submitting...'
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Request
          </>
        )}
      </button>
    </form>
  )
}

function ChangeRequestsList({ studentId }: { studentId: string }) {
  const [requests, setRequests] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  const loadRequests = async () => {
    try {
      const res = await fetch(`/api/change-requests?studentId=${studentId}`)
      const data = await res.json()
      setRequests(data.requests || [])
    } catch {
      // Silently fail
    } finally {
      setLoaded(true)
    }
  }

  if (!loaded) {
    loadRequests()
    return null
  }

  if (requests.length === 0) return null

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <h3 className="font-semibold text-slate-900 mb-4">Previous Requests</h3>
      <div className="space-y-3">
        {requests.map((req: any) => (
          <div key={req.id} className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-900 capitalize">
                {req.type.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-700'}`}>
                {req.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">{req.description}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(req.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentDashboardPage() {
  const [email, setEmail] = useState('')
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showChangeForm, setShowChangeForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
      case 'rejected':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          text: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
      case 'edits_requested':
        return {
          icon: <FileEdit className="w-6 h-6 text-amber-600" />,
          text: 'Edits Requested',
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

  const getStatusSubtitle = (student: any) => {
    switch (student.status) {
      case 'deployed':
        return 'Your portfolio is live and ready to share'
      case 'approved':
        return 'Your portfolio is being built'
      case 'submitted':
        return 'We are reviewing your submission'
      case 'rejected':
        return 'Your submission was not approved'
      case 'edits_requested':
        return 'Please update your submission based on our feedback'
      case 'error':
        return 'There was an issue with your submission'
      default:
        return 'We are reviewing your submission'
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
                      {getStatusSubtitle(studentData.student)}
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

              {/* Rejection details */}
              {studentData.student.status === 'rejected' && (
                <div className="mt-6 space-y-4">
                  {studentData.student.rejection_reason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1">Reason</p>
                      <p className="text-sm text-red-800">{studentData.student.rejection_reason}</p>
                    </div>
                  )}
                  {studentData.student.refund_id && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        A refund has been issued. It may take 5-10 business days to appear on your statement.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-slate-600">
                    If you believe this was a mistake or would like to resubmit, please contact us at{' '}
                    <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">hello@stackresume.com</a>.
                  </p>
                </div>
              )}

              {/* Edits requested details */}
              {studentData.student.status === 'edits_requested' && (
                <div className="mt-6 space-y-4">
                  {studentData.student.error_message && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-900 mb-1">What to update</p>
                      <p className="text-sm text-amber-800 whitespace-pre-line">
                        {studentData.student.error_message.replace('Edits requested: ', '')}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-slate-600">
                    Please update your content based on the feedback above and resubmit. 
                    Contact us at{' '}
                    <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">hello@stackresume.com</a>
                    {' '}if you have questions.
                  </p>
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

            {/* Change Request Section */}
            {studentData.student.status === 'deployed' && (
              <div className="bg-white rounded-lg border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Request Changes</h3>
                  <button
                    onClick={() => setShowChangeForm(!showChangeForm)}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {showChangeForm ? 'Cancel' : 'New Request'}
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Need to update your portfolio? Submit a change request and we will handle it.
                </p>
                {showChangeForm && (
                  <ChangeRequestForm
                    studentId={studentData.student.id}
                    onSubmitted={() => setRefreshKey((k: number) => k + 1)}
                  />
                )}
              </div>
            )}

            {/* Previous Change Requests */}
            <ChangeRequestsList key={refreshKey} studentId={studentData.student.id} />
          </div>
        )}
      </div>
    </div>
  )
}
