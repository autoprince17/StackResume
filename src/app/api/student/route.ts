import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/db/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const { data: student, error } = await getSupabaseAdmin()
      .from('students')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Sanitize response - don't expose internal fields
    const {
      stripe_payment_intent_id,
      refund_id,
      error_message,
      ...safeStudent
    } = student as any

    return NextResponse.json({ student: safeStudent })
  } catch (error) {
    console.error('Student lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup student' },
      { status: 500 }
    )
  }
}
