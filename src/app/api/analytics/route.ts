import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/db/admin'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { isValidUUID } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// POST: Record a page view (called from portfolio tracking pixel)
export async function POST(req: NextRequest) {
  // Rate limit: max 60 analytics pings per IP per minute (generous for page views)
  const rl = checkRateLimit(getClientIdentifier(req, 'analytics-track'), {
    maxRequests: 60,
    windowSeconds: 60,
  })
  if (!rl.allowed) {
    return new NextResponse(null, { status: 204 }) // Silently drop — don't break portfolio
  }

  try {
    const { studentId, referrer, deviceType } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    if (!isValidUUID(studentId)) {
      return new NextResponse(null, { status: 204 }) // Silently drop invalid IDs like rate limit
    }

    // Determine device type from User-Agent if not provided
    const ua = req.headers.get('user-agent') || ''
    const resolvedDeviceType = deviceType || detectDeviceType(ua)

    // Check if there's an existing analytics record for this student + referrer + device combo today
    const today = new Date().toISOString().split('T')[0]
    
    const { data: existing } = await getSupabaseAdmin()
      .from('portfolio_analytics')
      .select('id, page_views')
      .eq('student_id', studentId)
      .eq('referrer', referrer || 'direct')
      .eq('device_type', resolvedDeviceType)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .single()

    if (existing) {
      // Increment page views
      await (getSupabaseAdmin() as any)
        .from('portfolio_analytics')
        .update({ page_views: (existing as any).page_views + 1 })
        .eq('id', (existing as any).id)
    } else {
      // Create new analytics record
      await (getSupabaseAdmin() as any)
        .from('portfolio_analytics')
        .insert({
          student_id: studentId,
          page_views: 1,
          referrer: referrer || 'direct',
          device_type: resolvedDeviceType,
        })
    }

    // Return a 1x1 transparent pixel for img-based tracking
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return new NextResponse(null, { status: 204 }) // Don't break the portfolio page
  }
}

// GET: Retrieve analytics for a student (admin or student dashboard)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    if (!isValidUUID(studentId)) {
      return NextResponse.json({ error: 'Invalid studentId format' }, { status: 400 })
    }

    // Check that student exists and has analytics enabled
    const { data: student } = await getSupabaseAdmin()
      .from('students')
      .select('id, tier')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Only Professional and Flagship tiers get analytics
    if ((student as any).tier === 'starter') {
      return NextResponse.json({ 
        error: 'Analytics not available on Starter tier',
        upgrade: true 
      }, { status: 403 })
    }

    const { data: analytics, error } = await getSupabaseAdmin()
      .from('portfolio_analytics')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Aggregate stats
    const records = (analytics || []) as any[]
    const totalViews = records.reduce((sum: number, r: any) => sum + (r.page_views || 0), 0)
    
    // Group by referrer
    const byReferrer: Record<string, number> = {}
    records.forEach((r: any) => {
      byReferrer[r.referrer] = (byReferrer[r.referrer] || 0) + r.page_views
    })

    // Group by device type
    const byDevice: Record<string, number> = {}
    records.forEach((r: any) => {
      byDevice[r.device_type] = (byDevice[r.device_type] || 0) + r.page_views
    })

    return NextResponse.json({
      totalViews,
      byReferrer,
      byDevice,
      records: records.slice(0, 100), // Last 100 records
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function detectDeviceType(ua: string): string {
  if (/mobile/i.test(ua)) return 'mobile'
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  return 'desktop'
}
