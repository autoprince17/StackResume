'use server'

import { getSupabaseAdmin } from '@/lib/db/admin'
import { validateSubmissionQuality } from '@/lib/validation'
import Stripe from 'stripe'
import { 
  sendSubmissionApproved, 
  sendSubmissionRejected, 
  sendEditsRequested 
} from '@/lib/email'
import { getStripeSecretKey } from '@/lib/env'

// Lazy initialization of Stripe client
let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripe
}

export async function getPendingSubmissions() {
  const { data, error } = await getSupabaseAdmin()
    .from('students')
    .select(`
      *,
      profiles(*),
      projects(*),
      experience(*),
      social_links(*),
      assets(*),
      tier_limits_snapshot(*)
    `)
    .in('status', ['submitted', 'edits_requested'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch pending submissions:', error)
    return []
  }

  // Add quality validation to each submission
  return (data as any[]).map((student: any) => {
    const qualityCheck = validateSubmissionQuality({
      bio: student.profiles?.bio || '',
      projects: student.projects || []
    })

    return {
      ...student,
      qualityCheck
    }
  })
}

export async function getAllStudents() {
  const { data, error } = await getSupabaseAdmin()
    .from('students')
    .select(`
      *,
      profiles(role),
      deployment_queue(status as deployment_status)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch students:', error)
    return []
  }

  return data
}

export async function getStudentDetails(studentId: string): Promise<{
  student: any
  profile: any
  projects: any
  experience: any
  socialLinks: any
  assets: any
  tierSnapshot: any
  qualityCheck: { valid: boolean; errors: string[] }
} | null> {
  const { data: student, error: studentError } = await getSupabaseAdmin()
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError || !student) return null

  const { data: profileData } = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const profile: any = profileData

  const { data: projectsData } = await getSupabaseAdmin()
    .from('projects')
    .select('*')
    .eq('student_id', studentId)
    .order('order')
  const projects: any[] = projectsData || []

  const { data: experienceData } = await getSupabaseAdmin()
    .from('experience')
    .select('*')
    .eq('student_id', studentId)
    .order('order')
  const experience: any[] = experienceData || []

  const { data: socialLinksData } = await getSupabaseAdmin()
    .from('social_links')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const socialLinks: any = socialLinksData

  const { data: assetsData } = await getSupabaseAdmin()
    .from('assets')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const assets: any = assetsData

  const { data: tierSnapshotData } = await getSupabaseAdmin()
    .from('tier_limits_snapshot')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const tierSnapshot: any = tierSnapshotData

  const qualityCheck = validateSubmissionQuality({
    bio: profile?.bio || '',
    projects: projects || []
  })

  return {
    student,
    profile,
    projects,
    experience,
    socialLinks,
    assets,
    tierSnapshot,
    qualityCheck
  }
}

export async function approveSubmission(studentId: string) {
  try {
    // Get student info for status guard and email
    const { data: studentData } = await getSupabaseAdmin()
      .from('students')
      .select('name, email, status')
      .eq('id', studentId)
      .single()

    if (!studentData) {
      return { success: false, error: 'Student not found' }
    }

    const student = studentData as any

    // Status guard: only allow approval from submitted or edits_requested
    const allowedStatuses = ['submitted', 'edits_requested']
    if (!allowedStatuses.includes(student.status)) {
      return {
        success: false,
        error: `Cannot approve a student with status "${student.status}". Only submitted or edits_requested students can be approved.`
      }
    }

    // Update student status
    const { error: updateError } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ status: 'approved' })
      .eq('id', studentId)

    if (updateError) throw updateError

    // Prevent duplicate deployment queue entries — cancel any existing queued/processing entries first
    await (getSupabaseAdmin() as any)
      .from('deployment_queue')
      .update({ 
        status: 'failed',
        error_message: 'Superseded by new approval'
      })
      .eq('student_id', studentId)
      .in('status', ['queued', 'processing'])

    // Add to deployment queue
    const { error: queueError } = await getSupabaseAdmin()
      .from('deployment_queue')
      // @ts-ignore
      .insert({
        student_id: studentId,
        status: 'queued'
      })

    if (queueError) throw queueError

    // Send email notification
    await sendSubmissionApproved(student.email, student.name)

    return { success: true }
  } catch (error) {
    console.error('Failed to approve submission:', error)
    return { 
      success: false, 
      error: 'Failed to approve submission' 
    }
  }
}

export async function rejectSubmission(
  studentId: string, 
  reason: string,
  shouldRefund: boolean = false
) {
  try {
    // Get student details for status guard, refund, and email
    const { data: studentInfo } = await getSupabaseAdmin()
      .from('students')
      .select('name, email, stripe_payment_intent_id, status')
      .eq('id', studentId)
      .single()

    if (!studentInfo) {
      return { success: false, error: 'Student not found' }
    }

    const student = studentInfo as any

    // Status guard: only allow rejection from submitted or edits_requested
    const allowedStatuses = ['submitted', 'edits_requested']
    if (!allowedStatuses.includes(student.status)) {
      return { 
        success: false, 
        error: `Cannot reject a student with status "${student.status}". Only submitted or edits_requested students can be rejected.`
      }
    }

    // Process refund if requested
    let refundId: string | null = null
    let refundFailed = false
    let refundError: string | null = null

    if (shouldRefund && student.stripe_payment_intent_id) {
      try {
        const refund = await getStripe().refunds.create({
          payment_intent: student.stripe_payment_intent_id,
        })
        refundId = refund.id
        console.log(`Refund ${refundId} processed for student ${studentId}`)
      } catch (err) {
        refundFailed = true
        refundError = err instanceof Error ? err.message : 'Unknown refund error'
        console.error(`Refund failed for student ${studentId}:`, err)
        // Still reject even if refund fails — admin can retry manually via Stripe dashboard
      }
    }

    // Update student status with rejection reason in dedicated columns
    const { error } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        refund_id: refundId,
        error_message: refundFailed 
          ? `Refund failed: ${refundError}` 
          : null,
      })
      .eq('id', studentId)

    if (error) throw error

    // Cancel any queued deployments
    await (getSupabaseAdmin() as any)
      .from('deployment_queue')
      .update({ 
        status: 'failed',
        error_message: 'Submission rejected'
      })
      .eq('student_id', studentId)
      .in('status', ['queued', 'processing'])

    // Send rejection email
    await sendSubmissionRejected(
      student.email,
      student.name,
      reason,
      shouldRefund && !refundFailed
    )

    return { 
      success: true, 
      refundFailed,
      refundError: refundFailed ? refundError : undefined 
    }
  } catch (error) {
    console.error('Failed to reject submission:', error)
    return { 
      success: false, 
      error: 'Failed to reject submission' 
    }
  }
}

export async function requestEdits(
  studentId: string,
  editRequests: string[]
) {
  try {
    const description = editRequests.join('\n• ')

    // Get student info for status guard and email
    const { data: studentInfo } = await getSupabaseAdmin()
      .from('students')
      .select('name, email, status')
      .eq('id', studentId)
      .single()

    if (!studentInfo) {
      return { success: false, error: 'Student not found' }
    }

    const student = studentInfo as any

    // Status guard: only allow requesting edits from submitted
    if (student.status !== 'submitted') {
      return { 
        success: false, 
        error: `Cannot request edits for a student with status "${student.status}". Only submitted students can receive edit requests.`
      }
    }

    // Create a change_request record for each set of edits
    const { error: crError } = await (getSupabaseAdmin() as any)
      .from('change_requests')
      .insert({
        student_id: studentId,
        type: 'content_edit',
        description: `Admin requested edits:\n• ${description}`,
        status: 'approved', // Pre-approved since admin is requesting
        is_paid: false,
        amount: 0,
      })

    if (crError) throw crError

    // Update student status to edits_requested and store edit instructions
    const { error: updateError } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ 
        status: 'edits_requested',
        error_message: `Edits requested: ${editRequests.join('; ')}`,
      })
      .eq('id', studentId)

    if (updateError) throw updateError

    // Send email notification
    await sendEditsRequested(
      student.email,
      student.name,
      editRequests
    )

    return { success: true }
  } catch (error) {
    console.error('Failed to request edits:', error)
    return { 
      success: false, 
      error: 'Failed to send edit request' 
    }
  }
}

export async function allowResubmission(studentId: string) {
  try {
    // Get student info for status guard
    const { data: studentInfo } = await getSupabaseAdmin()
      .from('students')
      .select('name, email, status, refund_id')
      .eq('id', studentId)
      .single()

    if (!studentInfo) {
      return { success: false, error: 'Student not found' }
    }

    const student = studentInfo as any

    // Status guard: only allow resubmission from rejected
    if (student.status !== 'rejected') {
      return { 
        success: false, 
        error: `Cannot allow resubmission for a student with status "${student.status}". Only rejected students can be allowed to resubmit.`
      }
    }

    // Reset student status to edits_requested so they can update and resubmit
    const { error } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ 
        status: 'edits_requested',
        error_message: 'You have been allowed to resubmit. Please update your content and resubmit.',
      })
      .eq('id', studentId)

    if (error) throw error

    return { 
      success: true,
      requiresPayment: !!student.refund_id // If refunded, student needs to pay again
    }
  } catch (error) {
    console.error('Failed to allow resubmission:', error)
    return { 
      success: false, 
      error: 'Failed to allow resubmission' 
    }
  }
}

export async function getDeploymentQueue() {
  const { data, error } = await getSupabaseAdmin()
    .from('deployment_queue')
    .select(`
      *,
      students(name, email, tier, subdomain)
    `)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch deployment queue:', error)
    return []
  }

  return data
}

export async function getChangeRequests() {
  const { data, error } = await getSupabaseAdmin()
    .from('change_requests')
    .select(`
      *,
      students(name, email, subdomain)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch change requests:', error)
    return []
  }

  return data
}

export async function updateChangeRequestStatus(
  requestId: string,
  status: 'approved' | 'completed' | 'rejected'
) {
  try {
    const { error } = await getSupabaseAdmin()
      .from('change_requests')
      // @ts-ignore
      .update({ status })
      .eq('id', requestId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to update change request:', error)
    return { 
      success: false, 
      error: 'Failed to update change request' 
    }
  }
}

export async function updateCustomDomain(
  studentId: string,
  customDomain: string | null
) {
  try {
    // Validate domain format if provided
    if (customDomain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
      if (!domainRegex.test(customDomain)) {
        return { success: false, error: 'Invalid domain format' }
      }
    }

    const { error } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ custom_domain: customDomain })
      .eq('id', studentId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to update custom domain:', error)
    return { success: false, error: 'Failed to update custom domain' }
  }
}

export async function getStats() {
  try {
    const { count: totalStudents } = await getSupabaseAdmin()
      .from('students')
      .select('*', { count: 'exact', head: true })

    const { count: pendingSubmissions } = await getSupabaseAdmin()
      .from('students')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'edits_requested'])

    const { count: deployedSites } = await getSupabaseAdmin()
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'deployed')

    const { count: rejectedStudents } = await getSupabaseAdmin()
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    const { count: queuedDeployments } = await getSupabaseAdmin()
      .from('deployment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued')

    const { count: pendingChanges } = await getSupabaseAdmin()
      .from('change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    return {
      totalStudents: totalStudents || 0,
      pendingSubmissions: pendingSubmissions || 0,
      deployedSites: deployedSites || 0,
      rejectedStudents: rejectedStudents || 0,
      queuedDeployments: queuedDeployments || 0,
      pendingChanges: pendingChanges || 0
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return {
      totalStudents: 0,
      pendingSubmissions: 0,
      deployedSites: 0,
      rejectedStudents: 0,
      queuedDeployments: 0,
      pendingChanges: 0
    }
  }
}
