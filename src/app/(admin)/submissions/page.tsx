import { getPendingSubmissions } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage() {
  const submissions = await getPendingSubmissions()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Submissions</h1>
        <p className="text-slate-600 mt-2">
          Review and approve student submissions
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''} pending review
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg">No submissions pending review</p>
          <p className="text-slate-400 mt-2">
            Check back later or view all students
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission: any) => (
            <Card 
              key={submission.id} 
              className={`p-6 ${!submission.qualityCheck?.valid ? 'border-red-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {submission.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      submission.tier === 'starter' ? 'bg-slate-100 text-slate-700' :
                      submission.tier === 'professional' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {submission.tier}
                    </span>
                    {!submission.qualityCheck?.valid && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                        Needs attention
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 mb-4">{submission.email}</p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-slate-500">Role</p>
                      <p className="font-medium text-slate-900">
                        {submission.profiles?.role || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Projects</p>
                      <p className="font-medium text-slate-900">
                        {submission.projects?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Submitted</p>
                      <p className="font-medium text-slate-900">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {!submission.qualityCheck?.valid && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                      <p className="text-sm font-medium text-red-800 mb-1">Quality Issues:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {submission.qualityCheck.errors.map((error: string, i: number) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link
                  href={`/admin/submissions/${submission.id}`}
                  className="btn btn-primary ml-6"
                >
                  Review
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
