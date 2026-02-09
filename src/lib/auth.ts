'use server'

import { createClient } from '@/lib/db/server'
import { getSupabaseAdmin } from '@/lib/db/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isValidEmail } from '@/lib/validation'

// ── Admin auth ──────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Check if user is an admin (check by ID, not email)
  const { data: adminUser, error: adminError } = await getSupabaseAdmin()
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!adminUser || adminError) {
    await supabase.auth.signOut()
    return { 
      success: false, 
      error: 'This account does not have admin access. If you are a student, use the "Student" login option instead.' 
    }
  }

  return { success: true, user: data.user }
}

// ── Student auth (magic link) ───────────────────────────────────────────

export async function sendMagicLink(email: string) {
  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  // Verify a student record exists for this email before sending a link
  const { data: student } = await getSupabaseAdmin()
    .from('students')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!student) {
    return { 
      success: false, 
      error: 'No portfolio found for this email. Make sure you use the same email you submitted with.' 
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    console.error('Magic link send error:', error.message)
    return { success: false, error: 'Failed to send sign-in link. Please try again.' }
  }

  return { success: true }
}

// ── Shared auth utilities ───────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false

  const { data } = await getSupabaseAdmin()
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single()

  return !!data
}

/**
 * Get the student record for the currently authenticated user.
 * Returns null if not authenticated or no matching student found.
 */
export async function getAuthenticatedStudent() {
  const user = await getCurrentUser()
  if (!user?.email) return null

  const { data, error } = await getSupabaseAdmin()
    .from('students')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()

  if (error || !data) return null
  return data as any
}
