'use server'

import { createClient } from '@/lib/db/server'
import { getSupabaseAdmin } from '@/lib/db/admin'
import { 
  OnboardingFormData, 
  validateSubmissionQuality,
  serverOnboardingFormSchema
} from '@/lib/validation'
import { 
  enforceTierLimits, 
  createTierSnapshot,
  TIER_PRICES 
} from '@/lib/tiers'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'

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

export async function createPaymentIntent(tier: 'starter' | 'professional' | 'flagship') {
  try {
    const amount = TIER_PRICES[tier]
    
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'myr',
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        tier
      }
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    return {
      success: false,
      error: 'Failed to initialize payment'
    }
  }
}

export async function verifyPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
    
    // Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'Payment has not succeeded'
      }
    }

    // Check if payment has been fully refunded
    const charges = paymentIntent.latest_charge
    if (charges && typeof charges === 'object' && 'refunded' in charges && charges.refunded) {
      return {
        success: false,
        error: 'Payment has been refunded'
      }
    }

    return {
      success: true,
      tier: paymentIntent.metadata.tier as 'starter' | 'professional' | 'flagship'
    }
  } catch (error) {
    console.error('Payment verification failed:', error)
    return {
      success: false,
      error: 'Payment verification failed'
    }
  }
}

export async function submitOnboardingForm(
  data: OnboardingFormData,
  tier: 'starter' | 'professional' | 'flagship',
  paymentIntentId: string,
  files: {
    profilePhoto?: File
    resume?: File
  }
) {
  try {
    // Verify payment first
    const payment = await verifyPayment(paymentIntentId)
    if (!payment.success) {
      return { success: false, error: 'Payment verification failed' }
    }

    // Enforce tier limits server-side
    const tierCheck = enforceTierLimits(tier, {
      projectCount: data.projects.length,
      customDomain: null
    })

    if (!tierCheck.valid) {
      return { 
        success: false, 
        error: `Tier limit violation: ${tierCheck.errors.join(', ')}` 
      }
    }

    // Validate form data with Zod
    const validation = serverOnboardingFormSchema.safeParse(data)
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      const errorMessages = Object.entries(fieldErrors)
        .map(([key, msgs]) => `${key}: ${(msgs || []).join(', ')}`)
        .join('; ')
      return {
        success: false,
        error: `Validation failed: ${errorMessages}`
      }
    }

    // Prevent duplicate submissions for the same payment
    const { data: existingStudent } = await (getSupabaseAdmin() as any)
      .from('students')
      .select('id, subdomain')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle()

    if (existingStudent) {
      return {
        success: true,
        studentId: existingStudent.id,
        subdomain: existingStudent.subdomain || ''
      }
    }

    // Generate student ID
    const studentId = uuidv4()
    const subdomain = await getUniqueSubdomain(data.personalInfo.name)

    // Upload files to Supabase Storage
    const supabase = await createClient()
    let profilePhotoUrl: string | null = null
    let resumeUrl: string | null = null

    if (files.profilePhoto) {
      const { data: uploadData, error } = await getSupabaseAdmin()
        .storage
        .from('student-assets')
        .upload(`${studentId}/profile-photo`, files.profilePhoto)
      
      if (!error) {
        const { data: publicUrl } = getSupabaseAdmin()
          .storage
          .from('student-assets')
          .getPublicUrl(uploadData.path)
        profilePhotoUrl = publicUrl.publicUrl
      }
    }

    if (files.resume) {
      const { data: uploadData, error } = await getSupabaseAdmin()
        .storage
        .from('student-assets')
        .upload(`${studentId}/resume`, files.resume)
      
      if (!error) {
        const { data: publicUrl } = getSupabaseAdmin()
          .storage
          .from('student-assets')
          .getPublicUrl(uploadData.path)
        resumeUrl = publicUrl.publicUrl
      }
    }

    // Insert student record
    const { error: studentError } = await (getSupabaseAdmin() as any)
      .from('students')
      .insert({
        id: studentId,
        name: data.personalInfo.name,
        email: data.personalInfo.email,
        tier,
        status: 'submitted',
        subdomain,
        stripe_payment_intent_id: paymentIntentId
      })

    if (studentError) throw studentError

    // Insert profile
    const { error: profileError } = await (getSupabaseAdmin() as any)
      .from('profiles')
      .insert({
        student_id: studentId,
        role: data.technicalProfile.role,
        bio: data.personalInfo.bio,
        tech_stack: data.technicalProfile.techStack,
        skills: data.technicalProfile.skills
      })

    if (profileError) throw profileError

    // Insert projects
    const { error: projectsError } = await (getSupabaseAdmin() as any)
      .from('projects')
      .insert(
        data.projects.map((project, index) => ({
          student_id: studentId,
          title: project.title,
          description: project.description,
          tech_stack: project.techStack,
          github_url: project.githubUrl,
          live_url: project.liveUrl || null,
          order: index
        }))
      )

    if (projectsError) throw projectsError

    // Insert experience
    if (data.experience.length > 0) {
      const { error: expError } = await (getSupabaseAdmin() as any)
        .from('experience')
        .insert(
          data.experience.map((exp, index) => ({
            student_id: studentId,
            organization: exp.organization,
            role: exp.role,
            start_date: exp.startDate,
            end_date: exp.endDate || null,
            description: exp.description,
            order: index
          }))
        )

      if (expError) throw expError
    }

    // Insert social links
    const { error: socialError } = await (getSupabaseAdmin() as any)
      .from('social_links')
      .insert({
        student_id: studentId,
        github: data.socialLinks.github || null,
        linkedin: data.socialLinks.linkedin || null,
        existing_portfolio: data.socialLinks.existingPortfolio || null
      })

    if (socialError) throw socialError

    // Insert assets
    const { error: assetsError } = await (getSupabaseAdmin() as any)
      .from('assets')
      .insert({
        student_id: studentId,
        profile_photo_url: profilePhotoUrl,
        resume_url: resumeUrl
      })

    if (assetsError) throw assetsError

    // Create tier snapshot
    const tierSnapshot = createTierSnapshot(tier)
    const { error: snapshotError } = await (getSupabaseAdmin() as any)
      .from('tier_limits_snapshot')
      .insert({
        student_id: studentId,
        ...tierSnapshot
      })

    if (snapshotError) throw snapshotError

    return {
      success: true,
      studentId,
      subdomain
    }

  } catch (error) {
    console.error('Form submission failed:', error)
    return {
      success: false,
      error: 'Failed to submit form. Please try again.'
    }
  }
}

export async function getStudentByEmail(email: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('students')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data
}

export async function getStudentDashboard(studentId: string) {
  const { data: student, error: studentError } = await getSupabaseAdmin()
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError || !student) return null

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('student_id', studentId)
    .single()

  const { data: projects } = await getSupabaseAdmin()
    .from('projects')
    .select('*')
    .eq('student_id', studentId)
    .order('order')

  const { data: deployment } = await getSupabaseAdmin()
    .from('deployment_queue')
    .select('*')
    .eq('student_id', studentId)
    .single()

  return {
    student,
    profile,
    projects,
    deployment
  }
}

function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
}

async function getUniqueSubdomain(name: string): Promise<string> {
  const base = generateSubdomain(name)

  const { data: existing } = await (getSupabaseAdmin() as any)
    .from('students')
    .select('id')
    .eq('subdomain', base)
    .maybeSingle()

  if (!existing) return base

  // Append random suffix to avoid collision
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`.substring(0, 30)
}

export async function updateSubmission(
  studentId: string,
  data: Partial<OnboardingFormData>
) {
  try {
    // Get current student to verify status
    const { data: studentData } = await getSupabaseAdmin()
      .from('students')
      .select('status, refund_id')
      .eq('id', studentId)
      .single()

    const student = studentData as any

    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    // Only allow updates if status is edits_requested
    if (student.status !== 'edits_requested') {
      return { 
        success: false, 
        error: `Cannot update submission with status "${student.status}". Only edits_requested submissions can be updated.`
      }
    }

    // If the student was refunded, they cannot resubmit without paying again
    if (student.refund_id) {
      return {
        success: false,
        error: 'Your payment was refunded. Please make a new payment to resubmit.'
      }
    }

    // Update profile if provided
    if (data.personalInfo || data.technicalProfile) {
      const profileUpdates: Record<string, any> = {}
      if (data.personalInfo?.bio) profileUpdates.bio = data.personalInfo.bio
      if (data.technicalProfile?.role) profileUpdates.role = data.technicalProfile.role
      if (data.technicalProfile?.techStack) profileUpdates.tech_stack = data.technicalProfile.techStack
      if (data.technicalProfile?.skills) profileUpdates.skills = data.technicalProfile.skills

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await (getSupabaseAdmin() as any)
          .from('profiles')
          .update(profileUpdates)
          .eq('student_id', studentId)
        if (error) throw error
      }
    }

    // Update name/email if provided
    if (data.personalInfo) {
      const studentUpdates: Record<string, any> = {}
      if (data.personalInfo.name) studentUpdates.name = data.personalInfo.name
      if (data.personalInfo.email) studentUpdates.email = data.personalInfo.email

      if (Object.keys(studentUpdates).length > 0) {
        const { error } = await (getSupabaseAdmin() as any)
          .from('students')
          .update(studentUpdates)
          .eq('id', studentId)
        if (error) throw error
      }
    }

    // Replace projects if provided
    if (data.projects && data.projects.length > 0) {
      // Delete existing projects
      await getSupabaseAdmin()
        .from('projects')
        .delete()
        .eq('student_id', studentId)

      // Insert new projects
      const { error } = await (getSupabaseAdmin() as any)
        .from('projects')
        .insert(
          data.projects.map((project, index) => ({
            student_id: studentId,
            title: project.title,
            description: project.description,
            tech_stack: project.techStack,
            github_url: project.githubUrl,
            live_url: project.liveUrl || null,
            order: index
          }))
        )
      if (error) throw error
    }

    // Replace experience if provided
    if (data.experience) {
      await getSupabaseAdmin()
        .from('experience')
        .delete()
        .eq('student_id', studentId)

      if (data.experience.length > 0) {
        const { error } = await (getSupabaseAdmin() as any)
          .from('experience')
          .insert(
            data.experience.map((exp, index) => ({
              student_id: studentId,
              organization: exp.organization,
              role: exp.role,
              start_date: exp.startDate,
              end_date: exp.endDate || null,
              description: exp.description,
              order: index
            }))
          )
        if (error) throw error
      }
    }

    // Update social links if provided
    if (data.socialLinks) {
      const { error } = await (getSupabaseAdmin() as any)
        .from('social_links')
        .update({
          github: data.socialLinks.github || null,
          linkedin: data.socialLinks.linkedin || null,
          existing_portfolio: data.socialLinks.existingPortfolio || null
        })
        .eq('student_id', studentId)
      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Update submission failed:', error)
    return {
      success: false,
      error: 'Failed to update submission. Please try again.'
    }
  }
}

export async function resubmitStudent(studentId: string) {
  try {
    // Get current student to verify status
    const { data: studentData } = await getSupabaseAdmin()
      .from('students')
      .select('status, refund_id')
      .eq('id', studentId)
      .single()

    const student = studentData as any

    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    if (student.status !== 'edits_requested') {
      return { 
        success: false, 
        error: `Cannot resubmit with status "${student.status}". Only edits_requested submissions can be resubmitted.`
      }
    }

    if (student.refund_id) {
      return {
        success: false,
        error: 'Your payment was refunded. Please make a new payment to resubmit.'
      }
    }

    // Reset status back to submitted for re-review
    const { error } = await (getSupabaseAdmin() as any)
      .from('students')
      .update({ 
        status: 'submitted',
        error_message: null,
      })
      .eq('id', studentId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Resubmission failed:', error)
    return {
      success: false,
      error: 'Failed to resubmit. Please try again.'
    }
  }
}
