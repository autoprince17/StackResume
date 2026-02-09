'use client'

import { useState, useEffect } from 'react'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export function ChangeRequestsList({ studentId }: { studentId: string }) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [studentId])

  const loadRequests = async () => {
    try {
      const res = await fetch(`/api/change-requests?studentId=${studentId}`)
      const data = await res.json()
      setRequests(data.requests || [])
    } catch {
      // Silently fail — not critical
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null
  if (requests.length === 0) return null

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
