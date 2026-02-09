'use client'

import { useState } from 'react'
import { ChangeRequestForm } from './ChangeRequestForm'
import { ChangeRequestsList } from './ChangeRequestsList'

export function ChangeRequestSection({ studentId }: { studentId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Request Changes</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Need to update your portfolio? Submit a change request and we will handle it.
        </p>
        {showForm && (
          <ChangeRequestForm
            studentId={studentId}
            onSubmitted={() => setRefreshKey((k) => k + 1)}
          />
        )}
      </div>

      <ChangeRequestsList key={refreshKey} studentId={studentId} />
    </>
  )
}
