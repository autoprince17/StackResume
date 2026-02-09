import { NextRequest, NextResponse } from 'next/server'
import { processDeploymentQueue, retryFailedDeployments } from '@/lib/deployment'
import { getCronSecret } from '@/lib/env'
import { isAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Allow access via CRON_SECRET bearer token (cron jobs) or valid admin session (manual UI)
  const authHeader = req.headers.get('authorization')
  const cronSecret = getCronSecret()
  const hasCronToken = authHeader === `Bearer ${cronSecret}`

  if (!hasCronToken) {
    // Fall back to admin session check for manual deployments from the admin UI
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const isManual = body.manual === true

  try {
    // Process queue
    const result = await processDeploymentQueue()
    
    // Retry failed deployments
    const retryResult = await retryFailedDeployments()

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      retried: retryResult.retried,
      mode: isManual ? 'manual' : 'cron'
    })
  } catch (error) {
    console.error('Deployment queue processing failed:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

// GET endpoint for external cron services (cron-job.org, etc.)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const cronSecret = getCronSecret()
  
  if (!secret || secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processDeploymentQueue()
    const retryResult = await retryFailedDeployments()

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      retried: retryResult.retried,
      mode: 'external_cron'
    })
  } catch (error) {
    console.error('Deployment queue processing failed:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}
