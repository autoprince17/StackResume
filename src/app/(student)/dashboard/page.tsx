import { redirect } from 'next/navigation'
import { getAuthenticatedStudent } from '@/lib/auth'
import { Check, Clock, AlertCircle, ExternalLink, Loader2, FileEdit } from 'lucide-react'
import { ChangeRequestSection } from '@/components/dashboard/ChangeRequestSection'

function getStatusDisplay(status: string) {
  switch (status) {
    case 'deployed':
      return { icon: 'check', text: 'Live', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'approved':
      return { icon: 'spinner', text: 'Building', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'submitted':
      return { icon: 'clock', text: 'In Review', color: 'text-amber-600', bgColor: 'bg-amber-50' }
    case 'rejected':
      return { icon: 'alert', text: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50' }
    case 'edits_requested':
      return { icon: 'edit', text: 'Edits Requested', color: 'text-amber-600', bgColor: 'bg-amber-50' }
    case 'error':
      return { icon: 'alert', text: 'Issue', color: 'text-red-600', bgColor: 'bg-red-50' }
    default:
      return { icon: 'clock', text: status, color: 'text-slate-600', bgColor: 'bg-slate-50' }
  }
}

function StatusIcon({ type }: { type: string }) {
  switch (type) {
    case 'check':
      return <Check className="w-6 h-6 text-green-600" />
    case 'spinner':
      return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    case 'clock':
      return <Clock className="w-6 h-6 text-amber-600" />
    case 'alert':
      return <AlertCircle className="w-6 h-6 text-red-600" />
    case 'edit':
      return <FileEdit className="w-6 h-6 text-amber-600" />
    default:
      return <Clock className="w-6 h-6 text-slate-600" />
  }
}

function getStatusSubtitle(status: string) {
  switch (status) {
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

export default async function StudentDashboardPage() {
  const student = await getAuthenticatedStudent()

  // Middleware should prevent this, but handle the edge case
  if (!student) {
    redirect('/login?error=session_expired')
  }

  const status = getStatusDisplay(student.status)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Welcome back, {student.name}
        </h1>
        <p className="text-slate-600">{student.email}</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className={`p-6 rounded-lg ${status.bgColor}`}>
          <div className="flex items-center gap-4">
            <StatusIcon type={status.icon} />
            <div>
              <p className={`font-semibold ${status.color}`}>{status.text}</p>
              <p className="text-sm text-slate-600">
                {getStatusSubtitle(student.status)}
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio link */}
        {student.status === 'deployed' && student.subdomain && (
          <div className="mt-6">
            <a
              href={`https://${student.subdomain}.stackresume.com`}
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
        {student.status === 'rejected' && (
          <div className="mt-6 space-y-4">
            {student.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900 mb-1">Reason</p>
                <p className="text-sm text-red-800">{student.rejection_reason}</p>
              </div>
            )}
            {student.refund_id && (
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
        {student.status === 'edits_requested' && (
          <div className="mt-6 space-y-4">
            {student.error_message && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-1">What to update</p>
                <p className="text-sm text-amber-800 whitespace-pre-line">
                  {student.error_message.replace('Edits requested: ', '')}
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
            <span className="font-medium text-slate-900 capitalize">{student.tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Submitted</span>
            <span className="font-medium text-slate-900">
              {new Date(student.created_at).toLocaleDateString()}
            </span>
          </div>
          {student.subdomain && (
            <div className="flex justify-between">
              <span className="text-slate-600">Your URL</span>
              <span className="font-medium text-slate-900">
                {student.subdomain}.stackresume.com
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Change Request Section — only for deployed students */}
      {student.status === 'deployed' && (
        <ChangeRequestSection studentId={student.id} />
      )}

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
  )
}
