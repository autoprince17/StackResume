import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  // Validate env vars early — middleware runs on every matched request
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // ── Helper: get service-role admin client (for RLS-bypassing queries) ──
  function getAdminClient() {
    if (!supabaseServiceRoleKey) return null
    return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  // ── Protect /admin routes ─────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const adminClient = getAdminClient()
    if (!adminClient) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY for admin route check')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: adminUser } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      // Authenticated but not an admin — redirect home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ── Protect /dashboard routes ─────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify the authenticated user has a student record
    const adminClient = getAdminClient()
    if (!adminClient) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY for dashboard route check')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: student } = await adminClient
      .from('students')
      .select('id')
      .eq('email', user.email!)
      .maybeSingle()

    if (!student) {
      // Authenticated but no student record — could be an admin or unknown user.
      // Check if they're an admin and redirect appropriately.
      const { data: adminUser } = await adminClient
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (adminUser) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // Not a student and not an admin — redirect to login with error
      return NextResponse.redirect(
        new URL('/login?error=' + encodeURIComponent('No portfolio found for this account. Use the email you submitted your portfolio with.'), request.url)
      )
    }
  }

  // ── Login page: redirect authenticated users to their dashboard ───────
  if (pathname === '/login') {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const adminClient = getAdminClient()
      if (adminClient) {
        // Check admin first
        const { data: adminUser } = await adminClient
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (adminUser) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }

        // Check student
        const { data: student } = await adminClient
          .from('students')
          .select('id')
          .eq('email', user.email!)
          .maybeSingle()

        if (student) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
