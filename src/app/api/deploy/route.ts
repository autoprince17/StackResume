import { NextRequest, NextResponse } from 'next/server'
import { processDeploymentQueue, retryFailedDeployments } from '@/lib/deployment'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      retried: retryResult.retried
    })
  } catch (error) {
    console.error('Deployment queue processing failed:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}
