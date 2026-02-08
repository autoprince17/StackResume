import { getChangeRequests, updateChangeRequestStatus } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import { Clock, CheckCircle, AlertCircle, XCircle, FileEdit, Repeat, Paintbrush, Link2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'content_edit':
      return <FileEdit className="w-4 h-4 text-blue-600" />
    case 'template_swap':
      return <Repeat className="w-4 h-4 text-purple-600" />
    case 'redesign':
      return <Paintbrush className="w-4 h-4 text-amber-600" />
    case 'link_update':
      return <Link2 className="w-4 h-4 text-green-600" />
    default:
      return <FileEdit className="w-4 h-4 text-slate-600" />
  }
}

function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    content_edit: 'Content Edit',
    template_swap: 'Template Swap',
    redesign: 'Redesign',
    link_update: 'Link Update',
  }

  const colors: Record<string, string> = {
    content_edit: 'bg-blue-100 text-blue-700',
    template_swap: 'bg-purple-100 text-purple-700',
    redesign: 'bg-amber-100 text-amber-700',
    link_update: 'bg-green-100 text-green-700',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${colors[type] || 'bg-slate-100 text-slate-700'}`}>
      <TypeIcon type={type} />
      {labels[type] || type}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      )
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      )
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      )
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      )
    default:
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {status}
        </span>
      )
  }
}

async function handleAction(requestId: string, status: 'approved' | 'completed' | 'rejected') {
  'use server'
  await updateChangeRequestStatus(requestId, status)
}

export default async function ChangesPage() {
  const requests = (await getChangeRequests()) || []

  const pendingCount = requests.filter((r: any) => r.status === 'pending').length
  const approvedCount = requests.filter((r: any) => r.status === 'approved').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Change Requests</h1>
        <p className="text-slate-600 mt-2">
          Review and manage student change requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-slate-600">Pending Review</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
          <p className="text-sm text-slate-600">In Progress</p>
        </Card>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg">No change requests</p>
          <p className="text-slate-400 mt-2">
            Students can submit change requests from their dashboard
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {request.students?.name || 'Unknown Student'}
                    </h3>
                    <TypeBadge type={request.type} />
                    <StatusBadge status={request.status} />
                    {request.is_paid && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Paid — RM{((request.amount || 0) / 100).toFixed(0)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    {request.students?.email || '—'}
                    {request.students?.subdomain && (
                      <span className="ml-3 text-slate-400">
                        {request.students.subdomain}.stackresume.com
                      </span>
                    )}
                  </p>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-900">{request.description || 'No description provided'}</p>
                  </div>

                  <p className="text-xs text-slate-400">
                    Submitted {new Date(request.created_at).toLocaleDateString()} at{' '}
                    {new Date(request.created_at).toLocaleTimeString()}
                  </p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex flex-col gap-2 ml-6">
                    <form action={handleAction.bind(null, request.id, 'approved')}>
                      <button type="submit" className="btn btn-primary w-full text-sm">
                        Approve
                      </button>
                    </form>
                    <form action={handleAction.bind(null, request.id, 'rejected')}>
                      <button type="submit" className="btn btn-secondary w-full text-sm text-red-600 hover:text-red-700">
                        Reject
                      </button>
                    </form>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="ml-6">
                    <form action={handleAction.bind(null, request.id, 'completed')}>
                      <button type="submit" className="btn btn-primary text-sm">
                        Mark Complete
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
