import { NextResponse } from 'next/server'
import { testEmailConfiguration } from '@/lib/email'

/**
 * Test email configuration endpoint
 * GET /api/auth/test-email?to=your-email@example.com
 * 
 * This endpoint verifies your SMTP settings are working correctly.
 * Only use in development - remove or protect in production!
 */
export async function GET(req: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const testEmail = searchParams.get('to')

    if (!testEmail) {
      return NextResponse.json(
        { 
          error: 'Missing "to" parameter',
          usage: 'GET /api/auth/test-email?to=your-email@example.com'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Test the configuration
    const result = await testEmailConfiguration(testEmail)

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      messageId: result.messageId,
      note: 'Check your inbox (and spam folder) for the test email'
    })
  } catch (error: any) {
    console.error('Email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      help: {
        'SMTP not configured': 'Set SMTP_USER and SMTP_PASS in .env.local',
        'Authentication failed': 'Check your SMTP credentials are correct',
        'Connection refused': 'Verify SMTP_HOST and SMTP_PORT are correct',
        'For Gmail': 'Use an App Password, not your regular password. Enable 2FA and generate at https://myaccount.google.com/apppasswords',
        'For SendGrid': 'Create an API key at https://app.sendgrid.com/settings/api_keys',
      }
    }, { status: 500 })
  }
}
