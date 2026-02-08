'use server'

import { supabaseAdmin } from '@/lib/db/admin'
import { validateSubmissionQuality } from '@/lib/validation'

export async function getPendingSubmissions() {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError || !student) return null

  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const profile: any = profileData

  const { data: projectsData } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('student_id', studentId)
    .order('order')
  const projects: any[] = projectsData || []

  const { data: experienceData } = await supabaseAdmin
    .from('experience')
    .select('*')
    .eq('student_id', studentId)
    .order('order')
  const experience: any[] = experienceData || []

  const { data: socialLinksData } = await supabaseAdmin
    .from('social_links')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const socialLinks: any = socialLinksData

  const { data: assetsData } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('student_id', studentId)
    .single()
  const assets: any = assetsData

  const { data: tierSnapshotData } = await supabaseAdmin
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
    // Update student status
    const { error: updateError } = await (supabaseAdmin as any)
      .from('students')
      .update({ status: 'approved' })
      .eq('id', studentId)

    if (updateError) throw updateError

    // Add to deployment queue
    const { error: queueError } = await supabaseAdmin
      .from('deployment_queue')
      // @ts-ignore
      .insert({
        student_id: studentId,
        status: 'queued'
      })

    if (queueError) throw queueError

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
    // Get student details for refund if needed
    if (shouldRefund) {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('stripe_payment_intent_id')
        .eq('id', studentId)
        .single()

      if ((student as any)?.stripe_payment_intent_id) {
        // Process refund through Stripe (implementation depends on your refund policy)
        // This is a placeholder - actual refund logic would go here
        console.log(`Processing refund for ${studentId}`)
      }
    }

    // Update student status to indicate rejection
    const { error } = await supabaseAdmin
      .from('students')
      // @ts-ignore
      .update({ 
        status: 'error',
        // You might want to add a rejection_reason field to the schema
      })
      .eq('id', studentId)

    if (error) throw error

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
    // This would typically trigger an email to the student
    // For now, we'll just log it - email implementation depends on your email provider
    console.log(`Edit requests for ${studentId}:`, editRequests)

    // You might want to track edit requests in a separate table
    // or add them as a field to the students table

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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin
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

export async function getStats() {
  try {
    const { count: totalStudents } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })

    const { count: pendingSubmissions } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted')

    const { count: deployedSites } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'deployed')

    const { count: queuedDeployments } = await supabaseAdmin
      .from('deployment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued')

    const { count: pendingChanges } = await supabaseAdmin
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
