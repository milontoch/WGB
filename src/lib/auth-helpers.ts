// Server-side authorization helpers for API routes
// Use these to protect your API endpoints based on user roles

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export type UserRole = 'admin' | 'provider' | 'customer'

interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name?: string | null
}

/**
 * Get user from Authorization header (Bearer token)
 * Use this when you need to verify JWT tokens from client requests
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  if (!token) return null

  // Verify token using admin client
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  
  if (userError || !userData.user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name')
    .eq('id', userData.user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: userData.user.id,
    email: userData.user.email || '',
    role: profile.role as UserRole,
    full_name: profile.full_name
  }
}

/**
 * Get user from request Authorization header
 */
export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  
  if (!token) {
    return getCurrentUser() // Fallback to cookie-based auth
  }

  return getUserFromToken(token)
}

/**
 * Get the current authenticated user from the request
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    role: profile.role as UserRole,
    full_name: profile.full_name
  }
}

/**
 * Require authentication from request (supports both cookie and token auth)
 * Use in API routes to ensure user is logged in
 * 
 * @example
 * export async function POST(req: Request) {
 *   const user = await requireAuthFromRequest(req)
 *   // user is guaranteed to be authenticated here
 * }
 */
export async function requireAuthFromRequest(req: Request): Promise<AuthUser> {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    throw new Error('Unauthorized - Authentication required')
  }
  
  return user
}

/**
 * Require admin role from request
 * Use in admin API routes
 * 
 * @example
 * export async function POST(req: Request) {
 *   const admin = await requireAdminFromRequest(req)
 *   // user is guaranteed to be an admin here
 * }
 */
export async function requireAdminFromRequest(req: Request): Promise<AuthUser> {
  const user = await requireAuthFromRequest(req)
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden - Admin access required')
  }
  
  return user
}

/**
 * Require provider or admin role from request
 */
export async function requireProviderFromRequest(req: Request): Promise<AuthUser> {
  const user = await requireAuthFromRequest(req)
  
  if (user.role !== 'provider' && user.role !== 'admin') {
    throw new Error('Forbidden - Provider access required')
  }
  
  return user
}

// ====================================================
// Legacy methods (cookie-based only, for Server Components)
// ====================================================

/**
 * Require authentication - throws error if not authenticated
 * Use in Server Components/Actions (not API routes)
 * For API routes, use requireAuthFromRequest(req)
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized - Authentication required')
  }
  
  return user
}

/**
 * Require admin role - throws error if not admin
 * Use in admin API routes
 * 
 * @example
 * export async function POST(req: NextRequest) {
 *   const admin = await requireAdmin()
 *   // user is guaranteed to be an admin here
 * }
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden - Admin access required')
  }
  
  return user
}

/**
 * Require provider or admin role - throws error if neither
 * Use in provider API routes
 * 
 * @example
 * export async function POST(req: NextRequest) {
 *   const provider = await requireProvider()
 *   // user is guaranteed to be a provider or admin here
 * }
 */
export async function requireProvider(): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (user.role !== 'provider' && user.role !== 'admin') {
    throw new Error('Forbidden - Provider access required')
  }
  
  return user
}

/**
 * Check if user has specific role
 * 
 * @example
 * const isAdmin = await hasRole('admin')
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if user has any of the specified roles
 * 
 * @example
 * const canAccess = await hasAnyRole(['admin', 'provider'])
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  return user ? roles.includes(user.role) : false
}

/**
 * Get user by ID using admin client (bypasses RLS)
 * Only use in server-side code where you need admin access
 * 
 * @example
 * const targetUser = await getUserById('uuid-here')
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
    full_name: profile.full_name
  }
}

/**
 * Update user role (admin only operation)
 * 
 * @example
 * await updateUserRole('uuid-here', 'provider')
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  // Verify caller is admin
  await requireAdmin()

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`)
  }
}
