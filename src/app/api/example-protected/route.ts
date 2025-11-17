import { NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireProvider } from "@/lib/auth-helpers";

// Example: Public endpoint (no auth required)
export async function GET(req: Request) {
  return NextResponse.json({
    message: "This is a public endpoint",
    data: "Anyone can access this",
  });
}

// Example: Protected endpoint (requires authentication)
// Uncomment to use:
/*
export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    
    return NextResponse.json({ 
      message: 'You are authenticated!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 401 }
    )
  }
}
*/

// Example: Admin-only endpoint
// Uncomment to use:
/*
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    
    // Do admin operations here
    
    return NextResponse.json({ 
      message: 'Admin operation successful',
      performed_by: admin.email
    })
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 403
    return NextResponse.json(
      { error: error.message }, 
      { status }
    )
  }
}
*/

// Example: Provider or Admin endpoint
// Uncomment to use:
/*
export async function PUT(req: Request) {
  try {
    const user = await requireProvider()
    const body = await req.json()
    
    // Do provider operations here
    
    return NextResponse.json({ 
      message: 'Provider operation successful',
      user_role: user.role
    })
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 403
    return NextResponse.json(
      { error: error.message }, 
      { status }
    )
  }
}
*/
