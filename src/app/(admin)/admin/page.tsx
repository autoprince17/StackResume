import { getStats, getPendingSubmissions, getDeploymentQueue } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getStats()
  const pendingSubmissions = (await getPendingSubmissions()) || []
  const deploymentQueue = (await getDeploymentQueue()) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Overview of your StackResume operation</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-6 gap-4">
        <Card className="p-6">
          <p className="text-sm text-slate-600 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
        </Card>
        <Card className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-slate-600 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-amber-700">{stats.pendingSubmissions}</p>
        </Card>
        <Card className="p-6 border-green-200 bg-green-50">
          <p className="text-sm text-slate-600 mb-1">Deployed</p>
          <p className="text-3xl font-bold text-green-700">{stats.deployedSites}</p>
        </Card>
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-slate-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-700">{stats.rejectedStudents}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600 mb-1">In Queue</p>
          <p className="text-3xl font-bold text-slate-900">{stats.queuedDeployments}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600 mb-1">Change Requests</p>
          <p className="text-3xl font-bold text-slate-900">{stats.pendingChanges}</p>
        </Card>
      </div>

      {/* Pending Submissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Pending Review</h2>
          <Link 
            href="/admin/submissions" 
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            View all →
          </Link>
        </div>

        {pendingSubmissions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No submissions pending review</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.slice(0, 5).map((submission: any) => (
              <Card key={submission.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{submission.name}</h3>
                    <p className="text-sm text-slate-600">{submission.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.tier === 'starter' ? 'bg-slate-100 text-slate-700' :
                        submission.tier === 'professional' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {submission.tier}
                      </span>
                      <span className="text-xs text-slate-500">
                        {submission.profiles?.role || 'No role'}
                      </span>
                      {submission.qualityCheck && !submission.qualityCheck.valid && submission.qualityCheck.errors?.length > 0 && (
                        <span className="text-xs text-red-600">
                          {submission.qualityCheck.errors.length} issues
                        </span>
                      )}
                      {submission.status === 'edits_requested' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Edits Requested
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/submissions/${submission.id}`}
                    className="btn btn-primary text-sm"
                  >
                    Review
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Deployment Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Deployment Queue</h2>
          <Link 
            href="/admin/queue" 
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            View all →
          </Link>
        </div>

        {deploymentQueue.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No deployments in queue</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deploymentQueue.slice(0, 5).map((item: any) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.students?.name}</h3>
                    <p className="text-sm text-slate-600">
                      {item.students?.subdomain}.stackresume.com
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    item.status === 'queued' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
