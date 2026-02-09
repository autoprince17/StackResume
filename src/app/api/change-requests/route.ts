import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/db/admin'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { isValidUUID } from '@/lib/validation'

export async function POST(req: NextRequest) {
  // Rate limit: max 10 change requests per IP per minute
  const rl = checkRateLimit(getClientIdentifier(req, 'change-request'), {
    maxRequests: 10,
    windowSeconds: 60,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rl.headers }
    )
  }

  try {
    const { studentId, type, description } = await req.json()

    if (!studentId || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, type, description' },
        { status: 400 }
      )
    }

    if (!isValidUUID(studentId)) {
      return NextResponse.json(
        { error: 'Invalid studentId format' },
        { status: 400 }
      )
    }

    const validTypes = ['content_edit', 'template_swap', 'redesign', 'link_update']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify student exists
    const { data: student, error: studentError } = await getSupabaseAdmin()
      .from('students')
      .select('id, status')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Block change requests from rejected students
    const studentRecord = student as any
    if (studentRecord.status === 'rejected') {
      return NextResponse.json(
        { error: 'Change requests are not available for rejected submissions. Please contact support.' },
        { status: 403 }
      )
    }

    // Determine if this is a paid change (template_swap, redesign for non-flagship)
    const isPaid = type === 'template_swap' || type === 'redesign'
    const amount = isPaid ? (type === 'redesign' ? 9900 : 4900) : 0 // RM99 or RM49

    // Insert change request
    const { data: changeRequest, error } = await (getSupabaseAdmin() as any)
      .from('change_requests')
      .insert({
        student_id: studentId,
        type,
        description,
        status: 'pending',
        is_paid: false, // Will be set to true after payment if needed
        amount: isPaid ? amount : 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      changeRequest,
      requiresPayment: isPaid,
      amount,
    })
  } catch (error) {
    console.error('Failed to create change request:', error)
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      )
    }

    if (!isValidUUID(studentId)) {
      return NextResponse.json(
        { error: 'Invalid studentId format' },
        { status: 400 }
      )
    }

    const { data, error } = await getSupabaseAdmin()
      .from('change_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ requests: data || [] })
  } catch (error) {
    console.error('Failed to fetch change requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch change requests' },
      { status: 500 }
    )
  }
}
