import { getSupabaseAdmin } from '@/lib/db/admin'
import { Card } from '@/components/ui/card'
import { BarChart3, Eye, Globe, Monitor, Smartphone, Tablet } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAnalyticsOverview() {
  // Get all analytics data grouped by student
  const { data: students } = await getSupabaseAdmin()
    .from('students')
    .select('id, name, email, subdomain, tier, status')
    .in('tier', ['professional', 'flagship'])
    .eq('status', 'deployed')
    .order('created_at', { ascending: false })

  if (!students || students.length === 0) return { students: [], totals: { views: 0, portfolios: 0 } }

  const studentIds = (students as any[]).map((s: any) => s.id)

  const { data: analytics } = await getSupabaseAdmin()
    .from('portfolio_analytics')
    .select('*')
    .in('student_id', studentIds)

  const records = (analytics || []) as any[]

  // Aggregate per student
  const byStudent: Record<string, { views: number; referrers: Record<string, number>; devices: Record<string, number> }> = {}
  
  records.forEach((r: any) => {
    if (!byStudent[r.student_id]) {
      byStudent[r.student_id] = { views: 0, referrers: {}, devices: {} }
    }
    byStudent[r.student_id].views += r.page_views || 0
    byStudent[r.student_id].referrers[r.referrer] = (byStudent[r.student_id].referrers[r.referrer] || 0) + r.page_views
    byStudent[r.student_id].devices[r.device_type] = (byStudent[r.student_id].devices[r.device_type] || 0) + r.page_views
  })

  const totalViews = records.reduce((sum: number, r: any) => sum + (r.page_views || 0), 0)

  const enrichedStudents = (students as any[]).map((s: any) => ({
    ...s,
    analytics: byStudent[s.id] || { views: 0, referrers: {}, devices: {} },
  }))

  // Sort by views desc
  enrichedStudents.sort((a: any, b: any) => b.analytics.views - a.analytics.views)

  return {
    students: enrichedStudents,
    totals: {
      views: totalViews,
      portfolios: students.length,
    },
  }
}

function DeviceIcon({ type }: { type: string }) {
  switch (type) {
    case 'mobile': return <Smartphone className="w-3.5 h-3.5" />
    case 'tablet': return <Tablet className="w-3.5 h-3.5" />
    default: return <Monitor className="w-3.5 h-3.5" />
  }
}

export default async function AnalyticsPage() {
  const { students, totals } = await getAnalyticsOverview()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">
          Portfolio performance for Professional and Flagship students
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totals.views.toLocaleString()}</p>
          <p className="text-sm text-slate-600">Total Page Views</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totals.portfolios}</p>
          <p className="text-sm text-slate-600">Tracked Portfolios</p>
        </Card>
      </div>

      {students.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg">No analytics data yet</p>
          <p className="text-slate-400 mt-2">
            Analytics are collected for deployed Professional and Flagship portfolios
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {students.map((student: any) => (
            <Card key={student.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      student.tier === 'professional' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {student.tier}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Views */}
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Page Views</p>
                      <p className="text-2xl font-bold text-slate-900">{student.analytics.views.toLocaleString()}</p>
                      {student.subdomain && (
                        <a
                          href={`https://${student.subdomain}.stackresume.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          {student.subdomain}.stackresume.com
                        </a>
                      )}
                    </div>

                    {/* Top Referrers */}
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Top Referrers</p>
                      {Object.keys(student.analytics.referrers).length === 0 ? (
                        <p className="text-sm text-slate-400">No data</p>
                      ) : (
                        <div className="space-y-1">
                          {Object.entries(student.analytics.referrers)
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .slice(0, 3)
                            .map(([referrer, count]: any) => (
                              <div key={referrer} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700 flex items-center gap-1.5">
                                  <Globe className="w-3 h-3 text-slate-400" />
                                  {referrer}
                                </span>
                                <span className="text-slate-500 font-medium">{count}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Devices */}
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Devices</p>
                      {Object.keys(student.analytics.devices).length === 0 ? (
                        <p className="text-sm text-slate-400">No data</p>
                      ) : (
                        <div className="space-y-1">
                          {Object.entries(student.analytics.devices)
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .map(([device, count]: any) => (
                              <div key={device} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700 flex items-center gap-1.5 capitalize">
                                  <DeviceIcon type={device} />
                                  {device}
                                </span>
                                <span className="text-slate-500 font-medium">{count}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
