import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, full_name, role } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' }, 
        { status: 400 }
      )
    }

    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required' }, 
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'provider', 'customer']
    const userRole = role || 'customer'
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, provider, or customer' }, 
        { status: 400 }
      )
    }

    // Create user via admin client
    const { data: authData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email in development
      user_metadata: {
        full_name,
        role: userRole
      }
    })

    if (createErr || !authData.user) {
      return NextResponse.json(
        { error: createErr?.message || 'Unable to create user' }, 
        { status: 500 }
      )
    }

    // Profile is created automatically by database trigger (handle_new_user)
    // But we'll verify it was created
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileErr) {
      console.error('Profile creation failed:', profileErr)
      // Rollback user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      ok: true, 
      user_id: authData.user.id,
      email: authData.user.email
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    )
  }
}
