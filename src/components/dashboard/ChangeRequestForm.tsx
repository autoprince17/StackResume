'use client'

import { useState } from 'react'
import { FileEdit, Link2, Repeat, Paintbrush, Send } from 'lucide-react'

type ChangeRequestType = 'content_edit' | 'template_swap' | 'redesign' | 'link_update'

const changeTypes: { value: ChangeRequestType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'content_edit', label: 'Content Edit', description: 'Fix typos, update text, change descriptions', icon: <FileEdit className="w-4 h-4" /> },
  { value: 'link_update', label: 'Link Update', description: 'Update GitHub, LinkedIn, or project URLs', icon: <Link2 className="w-4 h-4" /> },
  { value: 'template_swap', label: 'Template Swap', description: 'Switch to a different template design', icon: <Repeat className="w-4 h-4" /> },
  { value: 'redesign', label: 'Redesign', description: 'Full design overhaul with new layout', icon: <Paintbrush className="w-4 h-4" /> },
]

export function ChangeRequestForm({ studentId, onSubmitted }: { studentId: string; onSubmitted: () => void }) {
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
