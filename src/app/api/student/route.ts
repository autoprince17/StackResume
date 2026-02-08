import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const { data: student, error } = await supabaseAdmin
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

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Student lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup student' },
      { status: 500 }
    )
  }
}
