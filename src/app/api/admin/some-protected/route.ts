import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Simple admin-protected route using manual token verification
 * POST /api/admin/some-protected
 * 
 * Pattern: Verify token -> Check role -> Perform admin operation
 */
export async function POST(req: Request) {
  try {
    // 1. Get and validate token from Authorization header
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      )
    }

    // 2. Verify token and get user
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)

    if (userErr || !userData.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // 3. Check user profile and role
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', userData.user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 403 }
      )
    }

    // 4. Verify admin role
    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // 5. Parse request body
    const body = await req.json()

    // 6. Perform admin operation here
    // Example: Update some protected resource
    // const { data, error } = await supabaseAdmin
    //   .from('some_table')
    //   .update(body)
    //   .eq('id', body.id)

    // 7. Return success response
    return NextResponse.json({
      ok: true,
      message: 'Admin operation successful',
      performed_by: {
        id: userData.user.id,
        email: userData.user.email,
        name: profile.full_name
      },
      data: body // Echo back for demo
    })

  } catch (error: any) {
    console.error('Admin route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example GET endpoint - same protection pattern
 */
export async function GET(req: Request) {
  try {
    // Same verification steps
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 })
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch some admin data
    return NextResponse.json({
      ok: true,
      message: 'Admin data retrieved',
      admin: {
        id: userData.user.id,
        email: userData.user.email,
        role: profile.role
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
