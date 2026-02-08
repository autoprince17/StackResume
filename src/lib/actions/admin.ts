'use server'

import { getSupabaseAdmin } from '@/lib/db/admin'
import { validateSubmissionQuality } from '@/lib/validation'
import Stripe from 'stripe'
import { 
  sendSubmissionApproved, 
  sendSubmissionRejected, 
  sendEditsRequested 
} from '@/lib/email'

// Lazy initialization of Stripe client
let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
    .eq('status', 'submitted')
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
    // Get student info for email
    const { data: studentData } = await getSupabaseAdmin()
      .from('students')
      .select('name, email')
      .eq('id', studentId)
      .single()

    // Update student status
    const { error: updateError } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ status: 'approved' })
      .eq('id', studentId)

    if (updateError) throw updateError

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
    if (studentData) {
      await sendSubmissionApproved(
        (studentData as any).email,
        (studentData as any).name
      )
    }

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
    // Get student details for refund and email
    const { data: studentInfo } = await getSupabaseAdmin()
      .from('students')
      .select('name, email, stripe_payment_intent_id')
      .eq('id', studentId)
      .single()

    if (shouldRefund && (studentInfo as any)?.stripe_payment_intent_id) {
      try {
        await getStripe().refunds.create({
          payment_intent: (studentInfo as any).stripe_payment_intent_id,
        })
        console.log(`Refund processed for student ${studentId}`)
      } catch (refundError) {
        console.error(`Refund failed for student ${studentId}:`, refundError)
        // Still reject even if refund fails — admin can retry manually via Stripe dashboard
      }
    }

    // Update student status with rejection reason
    const { error } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ 
        status: 'error',
        error_message: `Rejected: ${reason}${shouldRefund ? ' (refund issued)' : ''}`,
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
    if (studentInfo) {
      await sendSubmissionRejected(
        (studentInfo as any).email,
        (studentInfo as any).name,
        reason,
        shouldRefund
      )
    }

    return { success: true }
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

    // Get student info for email
    const { data: studentInfo } = await getSupabaseAdmin()
      .from('students')
      .select('name, email')
      .eq('id', studentId)
      .single()

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

    // Update student status to signal edits are needed
    const { error: updateError } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ 
        error_message: `Edits requested: ${editRequests.join('; ')}`,
      })
      .eq('id', studentId)

    if (updateError) throw updateError

    // Send email notification
    if (studentInfo) {
      await sendEditsRequested(
        (studentInfo as any).email,
        (studentInfo as any).name,
        editRequests
      )
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to request edits:', error)
    return { 
      success: false, 
      error: 'Failed to send edit request' 
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
      .eq('status', 'submitted')

    const { count: deployedSites } = await getSupabaseAdmin()
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'deployed')

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
      queuedDeployments: queuedDeployments || 0,
      pendingChanges: pendingChanges || 0
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return {
      totalStudents: 0,
      pendingSubmissions: 0,
      deployedSites: 0,
      queuedDeployments: 0,
      pendingChanges: 0
    }
  }
}
