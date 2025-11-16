import { NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Example: Get all users (Admin only)
 * GET /api/admin/users
 * 
 * Requires: Authorization: Bearer <token> header
 */
export async function GET(req: Request) {
  try {
    // Verify admin access
    const admin = await requireAdminFromRequest(req)

    // Fetch all users from profiles table
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      ok: true,
      users,
      fetched_by: admin.email,
      count: users?.length || 0
    })

  } catch (error: any) {
    console.error('Admin users fetch error:', error)

    // Handle authentication/authorization errors
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      )
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required. You do not have permission.' },
        { status: 403 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example: Update user details (Admin only)
 * POST /api/admin/users
 * 
 * Body: { user_id, updates: { full_name?, role? } }
 */
export async function POST(req: Request) {
  try {
    // Verify admin access
    const admin = await requireAdminFromRequest(req)

    const body = await req.json()
    const { user_id, updates } = body

    // Validation
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'updates object is required' },
        { status: 400 }
      )
    }

    // Validate allowed fields
    const allowedFields = ['full_name', 'role', 'avatar_url']
    const updateData: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: `No valid fields to update. Allowed: ${allowedFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate role if being updated
    if (updateData.role) {
      const validRoles = ['admin', 'provider', 'customer']
      if (!validRoles.includes(updateData.role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Update user using admin client
    const { data: updatedUser, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      throw new Error(`Update failed: ${error.message}`)
    }

    return NextResponse.json({
      ok: true,
      message: 'User updated successfully',
      user: updatedUser,
      updated_by: admin.email
    })

  } catch (error: any) {
    console.error('Admin user update error:', error)

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example: Delete user (Admin only)
 * DELETE /api/admin/users
 * 
 * Body: { user_id }
 */
export async function DELETE(req: Request) {
  try {
    // Verify admin access
    const admin = await requireAdminFromRequest(req)

    const body = await req.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    if (user_id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user (will cascade to profile due to foreign key)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return NextResponse.json({
      ok: true,
      message: 'User deleted successfully',
      deleted_by: admin.email
    })

  } catch (error: any) {
    console.error('Admin user delete error:', error)

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
