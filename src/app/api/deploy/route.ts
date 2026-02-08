import { NextRequest, NextResponse } from 'next/server'
import { processDeploymentQueue, retryFailedDeployments } from '@/lib/deployment'

export async function POST(req: NextRequest) {
  // Check authorization - allow both cron secret and admin session
  const authHeader = req.headers.get('authorization')
  const body = await req.json().catch(() => ({}))
  const isManual = body.manual === true
  
  // For cron jobs, check CRON_SECRET
  // For manual requests, we could check admin session here if needed
  if (authHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  
  if (secret !== process.env.CRON_SECRET) {
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
