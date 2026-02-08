import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // TEMPORARY: Disable admin check to test if this is the issue
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/submissions') ||
      request.nextUrl.pathname.startsWith('/deploy')) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('🔍 Middleware check:', {
      path: request.nextUrl.pathname,
      user: user ? { id: user.id, email: user.email } : null,
    })

    if (!user) {
      console.log('❌ No user, redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // TEMPORARILY COMMENT OUT THE ADMIN CHECK TO TEST
    /*
    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('🔍 Admin check:', { adminUser, adminError })

    if (!adminUser) {
      console.log('❌ User not in admin_users, redirecting to /')
      return NextResponse.redirect(new URL('/', request.url))
    }
    */

    console.log('✅ User authenticated, allowing access')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/submissions/:path*',
    '/deploy/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
