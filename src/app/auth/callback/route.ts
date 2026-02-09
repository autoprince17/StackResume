import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

/**
 * Auth callback handler for Supabase magic link / OTP flow.
 * Supabase redirects here with a `code` query param after the user clicks
 * the magic link in their email. We exchange it for a session, then redirect
 * to the appropriate dashboard based on user role.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (!code) {
    // No code present — redirect to login with an error
    return NextResponse.redirect(
      new URL('/login?error=Missing+authentication+code.+Please+request+a+new+sign-in+link.', origin)
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from within a Server Component —
            // cookies can only be set in a Route Handler or Server Action,
            // but this is fine here since this IS a Route Handler.
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Sign-in link expired or invalid. Please request a new one.')}`, origin)
    )
  }

  // Session established — redirect to the intended destination.
  // The middleware will handle role-based access checks.
  return NextResponse.redirect(new URL(next, origin))
}
