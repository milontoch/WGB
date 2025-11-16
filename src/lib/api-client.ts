/**
 * Client-side API helpers for making authenticated requests
 * Use these in your React components to call protected API routes
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Get the current user's access token for API requests
 */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

/**
 * Make an authenticated API request
 * Automatically includes Authorization header with user's token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('No authentication token available')
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// ====================================================
// ADMIN API HELPERS
// ====================================================

/**
 * Get all users (Admin only)
 */
export async function getAllUsers() {
  const response = await authenticatedFetch('/api/admin/users', {
    method: 'GET',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch users')
  }

  return response.json()
}

/**
 * Update user details (Admin only)
 */
export async function updateUser(userId: string, updates: {
  full_name?: string
  role?: 'admin' | 'provider' | 'customer'
  avatar_url?: string
}) {
  const response = await authenticatedFetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, updates }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update user')
  }

  return response.json()
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(userId: string) {
  const response = await authenticatedFetch('/api/admin/users', {
    method: 'DELETE',
    body: JSON.stringify({ user_id: userId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete user')
  }

  return response.json()
}

/**
 * Set user role (Admin only)
 */
export async function setUserRole(
  targetUserId: string,
  role: 'admin' | 'provider' | 'customer'
) {
  const response = await authenticatedFetch('/api/admin/set-role', {
    method: 'POST',
    body: JSON.stringify({ target_user_id: targetUserId, role }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to set user role')
  }

  return response.json()
}

/**
 * Call a protected admin endpoint
 */
export async function callProtectedAdminRoute(data: any) {
  const response = await authenticatedFetch('/api/admin/some-protected', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Admin operation failed')
  }

  return response.json()
}

// ====================================================
// OTP API HELPERS
// ====================================================

/**
 * Send OTP code
 */
export async function sendOtp(
  userId: string,
  purpose: 'login' | 'verify_email' | 'reset_password',
  email?: string
) {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, purpose, email }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send OTP')
  }

  return response.json()
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  userId: string,
  purpose: 'login' | 'verify_email' | 'reset_password',
  code: string
) {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, purpose, code }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to verify OTP')
  }

  return response.json()
}

// ====================================================
// EXAMPLE USAGE IN REACT COMPONENT
// ====================================================

/*
'use client'

import { useState } from 'react'
import { getAllUsers, updateUser, setUserRole } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

export default function AdminUsersPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const data = await getAllUsers()
      setUsers(data.users)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await setUserRole(userId, newRole)
      await fetchUsers() // Refresh list
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (!isAdmin) return <div>Access denied</div>

  return (
    <div>
      <button onClick={fetchUsers}>Load Users</button>
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>
            {user.email} - {user.role}
            <button onClick={() => handleRoleChange(user.id, 'admin')}>
              Make Admin
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
*/
