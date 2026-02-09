export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="text-center">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mx-auto" />
      </div>

      {/* Status card skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="p-6 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
            <div>
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Details skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="h-5 w-16 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
