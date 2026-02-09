import { NextRequest, NextResponse } from 'next/server'
import { 
  approveSubmission, 
  rejectSubmission, 
  requestEdits, 
  allowResubmission 
} from '@/lib/actions/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, action } = body

    if (!studentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, action' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'approve': {
        const result = await approveSubmission(studentId)
        return NextResponse.json(result)
      }

      case 'reject': {
        const { reason, shouldRefund } = body
        if (!reason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          )
        }
        const result = await rejectSubmission(studentId, reason, shouldRefund || false)
        return NextResponse.json(result)
      }

      case 'request_edits': {
        const { editRequests } = body
        if (!editRequests || !Array.isArray(editRequests) || editRequests.length === 0) {
          return NextResponse.json(
            { error: 'Edit requests array is required' },
            { status: 400 }
          )
        }
        const result = await requestEdits(studentId, editRequests)
        return NextResponse.json(result)
      }

      case 'allow_resubmission': {
        const result = await allowResubmission(studentId)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin action failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
