'use client'

import { useState } from 'react'
import { Check, X, AlertCircle, FileEdit, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ActionsPanelProps {
  studentId: string
  studentStatus: string
  studentName: string
  rejectionReason: string | null
  refundId: string | null
}

export default function ActionsPanel({ 
  studentId, 
  studentStatus, 
  studentName,
  rejectionReason,
  refundId
}: ActionsPanelProps) {
  const [mode, setMode] = useState<'idle' | 'reject' | 'edits' | 'confirming-approve'>('idle')
  const [reason, setReason] = useState('')
  const [shouldRefund, setShouldRefund] = useState(false)
  const [editRequests, setEditRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const canApprove = studentStatus === 'submitted' || studentStatus === 'edits_requested'
  const canReject = studentStatus === 'submitted' || studentStatus === 'edits_requested'
  const canRequestEdits = studentStatus === 'submitted'
  const canAllowResubmission = studentStatus === 'rejected'

  const handleApprove = async () => {
    if (mode !== 'confirming-approve') {
      setMode('confirming-approve')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/submissions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'approve' }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ success: true, message: 'Submission approved and queued for deployment.' })
        setMode('idle')
      } else {
        setResult({ success: false, message: data.error || 'Failed to approve.' })
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/submissions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'reject', reason, shouldRefund }),
      })
      const data = await res.json()
      if (data.success) {
        const refundMsg = data.refundFailed 
          ? ` Warning: refund failed (${data.refundError}). Retry via Stripe dashboard.`
          : shouldRefund ? ' Refund issued.' : ''
        setResult({ success: true, message: `Submission rejected.${refundMsg}` })
        setMode('idle')
        setReason('')
        setShouldRefund(false)
      } else {
        setResult({ success: false, message: data.error || 'Failed to reject.' })
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestEdits = async () => {
    if (!editRequests.trim()) return
    const edits = editRequests.split('\n').map(s => s.trim()).filter(Boolean)
    if (edits.length === 0) return

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/submissions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'request_edits', editRequests: edits }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ success: true, message: 'Edit request sent to student.' })
        setMode('idle')
        setEditRequests('')
      } else {
        setResult({ success: false, message: data.error || 'Failed to request edits.' })
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAllowResubmission = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/submissions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'allow_resubmission' }),
      })
      const data = await res.json()
      if (data.success) {
        const paymentNote = data.requiresPayment 
          ? ' Note: student was refunded and will need to pay again.'
          : ''
        setResult({ success: true, message: `Student can now resubmit.${paymentNote}` })
      } else {
        setResult({ success: false, message: data.error || 'Failed to allow resubmission.' })
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status context for rejected/edits_requested */}
      {studentStatus === 'rejected' && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-900 mb-1">Rejected</p>
          {rejectionReason && (
            <p className="text-sm text-red-800">Reason: {rejectionReason}</p>
          )}
          {refundId && (
            <p className="text-sm text-red-800 mt-1">Refund ID: {refundId}</p>
          )}
        </Card>
      )}

      {studentStatus === 'edits_requested' && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <p className="text-sm font-medium text-amber-900">Edits Requested</p>
          <p className="text-xs text-amber-700 mt-1">Waiting for student to update and resubmit.</p>
        </Card>
      )}

      {studentStatus === 'deployed' && (
        <Card className="p-4 border-green-200 bg-green-50">
          <p className="text-sm font-medium text-green-900">Deployed</p>
          <p className="text-xs text-green-700 mt-1">This portfolio is live. No further review actions available.</p>
        </Card>
      )}

      {/* Result feedback */}
      {result && (
        <Card className={`p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
        </Card>
      )}

      {/* Action buttons */}
      {mode === 'idle' && (
        <div className="flex flex-wrap gap-3">
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="btn btn-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
          )}
          {canReject && (
            <button
              onClick={() => setMode('reject')}
              disabled={loading}
              className="btn bg-red-100 text-red-700 hover:bg-red-200"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </button>
          )}
          {canRequestEdits && (
            <button
              onClick={() => setMode('edits')}
              disabled={loading}
              className="btn bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Request Edits
            </button>
          )}
          {canAllowResubmission && (
            <button
              onClick={handleAllowResubmission}
              disabled={loading}
              className="btn bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Allow Resubmission
            </button>
          )}
        </div>
      )}

      {/* Approve confirmation */}
      {mode === 'confirming-approve' && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-900 mb-3">
            Approve <strong>{studentName}</strong> and queue for deployment?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="btn btn-primary text-sm"
            >
              {loading ? 'Approving...' : 'Yes, approve'}
            </button>
            <button
              onClick={() => setMode('idle')}
              disabled={loading}
              className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Rejection form */}
      {mode === 'reject' && (
        <Card className="p-4 space-y-4">
          <h4 className="font-semibold text-slate-900">Reject Submission</h4>
          <div>
            <label className="label">Reason for rejection</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input min-h-[80px]"
              placeholder="Explain why this submission is being rejected..."
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="refund-toggle"
              checked={shouldRefund}
              onChange={(e) => setShouldRefund(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="refund-toggle" className="text-sm text-slate-700">
              Issue full refund via Stripe
            </label>
          </div>
          {shouldRefund && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                A full refund will be issued to the student's original payment method. This cannot be undone.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={loading || !reason.trim()}
              className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => { setMode('idle'); setReason(''); setShouldRefund(false) }}
              disabled={loading}
              className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Edit request form */}
      {mode === 'edits' && (
        <Card className="p-4 space-y-4">
          <h4 className="font-semibold text-slate-900">Request Edits</h4>
          <div>
            <label className="label">Edit instructions (one per line)</label>
            <textarea
              value={editRequests}
              onChange={(e) => setEditRequests(e.target.value)}
              className="input min-h-[100px]"
              placeholder={"Bio is too short — expand to at least 3 sentences\nProject 1 description needs more detail\nAdd at least one more project"}
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRequestEdits}
              disabled={loading || !editRequests.trim()}
              className="btn bg-amber-600 text-white hover:bg-amber-700 text-sm"
            >
              {loading ? 'Sending...' : 'Send Edit Request'}
            </button>
            <button
              onClick={() => { setMode('idle'); setEditRequests('') }}
              disabled={loading}
              className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
