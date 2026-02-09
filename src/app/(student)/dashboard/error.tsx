'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          We had trouble loading your dashboard. This is usually temporary.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="btn btn-primary w-full"
          >
            Try Again
          </button>
          <a
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  )
}
