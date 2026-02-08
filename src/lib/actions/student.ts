'use server'

import { createClient } from '@/lib/db/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { 
  OnboardingFormData, 
  validateSubmissionQuality 
} from '@/lib/validation'
import { 
  enforceTierLimits, 
  createTierSnapshot,
  TIER_PRICES 
} from '@/lib/tiers'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function createPaymentIntent(tier: 'starter' | 'professional' | 'flagship') {
  try {
    const amount = TIER_PRICES[tier]
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
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
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    return {
      success: paymentIntent.status === 'succeeded',
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

    // Generate student ID
    const studentId = uuidv4()
    const subdomain = generateSubdomain(data.personalInfo.name)

    // Upload files to Supabase Storage
    const supabase = await createClient()
    let profilePhotoUrl: string | null = null
    let resumeUrl: string | null = null

    if (files.profilePhoto) {
      const { data: uploadData, error } = await supabaseAdmin
        .storage
        .from('student-assets')
        .upload(`${studentId}/profile-photo`, files.profilePhoto)
      
      if (!error) {
        const { data: publicUrl } = supabaseAdmin
          .storage
          .from('student-assets')
          .getPublicUrl(uploadData.path)
        profilePhotoUrl = publicUrl.publicUrl
      }
    }

    if (files.resume) {
      const { data: uploadData, error } = await supabaseAdmin
        .storage
        .from('student-assets')
        .upload(`${studentId}/resume`, files.resume)
      
      if (!error) {
        const { data: publicUrl } = supabaseAdmin
          .storage
          .from('student-assets')
          .getPublicUrl(uploadData.path)
        resumeUrl = publicUrl.publicUrl
      }
    }

    // Insert student record
    const { error: studentError } = await (supabaseAdmin as any)
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
    const { error: profileError } = await (supabaseAdmin as any)
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
    const { error: projectsError } = await (supabaseAdmin as any)
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
      const { error: expError } = await (supabaseAdmin as any)
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
    const { error: socialError } = await (supabaseAdmin as any)
      .from('social_links')
      .insert({
        student_id: studentId,
        github: data.socialLinks.github || null,
        linkedin: data.socialLinks.linkedin || null,
        existing_portfolio: data.socialLinks.existingPortfolio || null
      })

    if (socialError) throw socialError

    // Insert assets
    const { error: assetsError } = await (supabaseAdmin as any)
      .from('assets')
      .insert({
        student_id: studentId,
        profile_photo_url: profilePhotoUrl,
        resume_url: resumeUrl
      })

    if (assetsError) throw assetsError

    // Create tier snapshot
    const tierSnapshot = createTierSnapshot(tier)
    const { error: snapshotError } = await (supabaseAdmin as any)
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
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data
}

export async function getStudentDashboard(studentId: string) {
  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError || !student) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('student_id', studentId)
    .single()

  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('student_id', studentId)
    .order('order')

  const { data: deployment } = await supabaseAdmin
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
