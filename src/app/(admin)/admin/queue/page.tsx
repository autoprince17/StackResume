import { getDeploymentQueue } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Clock, CheckCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'queued':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" />
          Queued
        </span>
      )
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processing
        </span>
      )
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3" />
          Failed
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

export default async function QueuePage() {
  const queue = await getDeploymentQueue()

  const queuedCount = queue.filter((item: any) => item.status === 'queued').length
  const processingCount = queue.filter((item: any) => item.status === 'processing').length
  const failedCount = queue.filter((item: any) => item.status === 'failed').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deployment Queue</h1>
          <p className="text-slate-600 mt-2">
            Monitor portfolio deployments
          </p>
        </div>
        <Link href="/admin/deploy" className="btn btn-primary">
          Manual Deploy
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{queuedCount}</p>
          <p className="text-sm text-slate-600">Queued</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
          <p className="text-sm text-slate-600">Processing</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
          <p className="text-sm text-slate-600">Failed</p>
        </Card>
      </div>

      {queue.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg">Deployment queue is empty</p>
          <p className="text-slate-400 mt-2">
            Approve submissions to add them to the queue
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((item: any) => (
            <Card key={item.id} className={`p-6 ${item.status === 'failed' ? 'border-red-200' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.students?.name || 'Unknown Student'}
                    </h3>
                    <StatusBadge status={item.status} />
                    {item.retry_count > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        {item.retry_count} retries
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{item.students?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Tier</p>
                      <p className="font-medium text-slate-900 capitalize">{item.students?.tier || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Subdomain</p>
                      <p className="font-medium text-slate-900">{item.students?.subdomain || '—'}.stackresume.com</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Created</p>
                      <p className="font-medium text-slate-900">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {item.deployment_url && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-500">Deployment URL</p>
                      <a
                        href={item.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {item.deployment_url}
                      </a>
                    </div>
                  )}

                  {item.error_message && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm font-medium text-red-800">Error:</p>
                      <p className="text-sm text-red-700">{item.error_message}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
