import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/server'
import { getSupabaseAdmin } from '@/lib/db/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: userError?.message || 'No user session',
      })
    }

    // Check admin_users with service role
    const { data: adminUser, error: adminError } = await getSupabaseAdmin()
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Also check with regular client
    const { data: adminUser2, error: adminError2 } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      adminCheckServiceRole: {
        found: !!adminUser,
        error: adminError?.message,
        data: adminUser,
      },
      adminCheckRegularClient: {
        found: !!adminUser2,
        error: adminError2?.message,
        data: adminUser2,
      },
      cookiesPresent: req.cookies.getAll().map(c => c.name),
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
