/**
 * Server-only email utilities using Nodemailer
 * Use this to send OTP codes, password resets, and other transactional emails
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Email configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

const FROM_EMAIL = process.env.SMTP_FROM || '"Beauty Services" <noreply@beautyservices.com>'

/**
 * Create and reuse a nodemailer transporter
 */
let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
      throw new Error(
        'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in environment variables.'
      )
    }

    transporter = nodemailer.createTransport(SMTP_CONFIG)
  }

  return transporter
}

/**
 * Send OTP verification email
 * 
 * @param to - Recipient email address
 * @param code - 6-digit OTP code
 * @param purpose - Purpose of the OTP (login, verify_email, reset_password)
 * @returns Promise with email send result
 */
export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: 'login' | 'verify_email' | 'reset_password' = 'login'
) {
  const transporter = getTransporter()

  // Customize subject and content based on purpose
  let subject = 'Your Verification Code'
  let title = 'Verification Code'
  let message = 'Use this code to complete your action'

  switch (purpose) {
    case 'login':
      subject = 'Your Login Verification Code'
      title = 'Login Verification'
      message = 'Someone is trying to sign in to your account. Use this code to proceed:'
      break
    case 'verify_email':
      subject = 'Verify Your Email Address'
      title = 'Email Verification'
      message = 'Please verify your email address with this code:'
      break
    case 'reset_password':
      subject = 'Password Reset Code'
      title = 'Reset Your Password'
      message = 'Use this code to reset your password:'
      break
  }

  const info = await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text: `${title}\n\n${message}\n\nYour code: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        ${message}
                      </p>
                      
                      <!-- OTP Code Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <div style="background-color: #f8f9fa; border: 2px dashed #E91E63; border-radius: 8px; padding: 20px; display: inline-block;">
                              <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Your verification code:</p>
                              <p style="margin: 0; font-size: 36px; font-weight: bold; color: #E91E63; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${code}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        This code will expire in <strong>10 minutes</strong>.
                      </p>
                      
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        If you didn't request this code, please ignore this email or contact support if you have concerns.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Beauty Services. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })

  console.log('Email sent:', info.messageId)
  return info
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const transporter = getTransporter()

  const info = await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to Beauty Services!',
    text: `Hi ${name},\n\nWelcome to Beauty Services! We're excited to have you.\n\nYou can now book appointments, shop our products, and enjoy our premium beauty services.\n\nBest regards,\nThe Beauty Services Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px;">
            <h1 style="color: #E91E63;">Welcome, ${name}!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              We're thrilled to have you join Beauty Services. You now have access to:
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.8;">
              <li>Premium beauty services and appointments</li>
              <li>Exclusive product collections</li>
              <li>Special member discounts</li>
              <li>Personalized recommendations</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" 
               style="display: inline-block; background: linear-gradient(135deg, #E91E63, #9C27B0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Get Started
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              © ${new Date().getFullYear()} Beauty Services. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
  })

  console.log('Welcome email sent:', info.messageId)
  return info
}

/**
 * Test email configuration
 * Run this to verify SMTP settings are working
 */
export async function testEmailConfiguration(testEmail: string) {
  try {
    const transporter = getTransporter()
    
    // Verify connection
    await transporter.verify()
    console.log('✅ SMTP connection verified')

    // Send test email
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: testEmail,
      subject: 'Test Email - Beauty Services',
      text: 'This is a test email to verify your SMTP configuration is working correctly.',
      html: '<p>This is a test email to verify your SMTP configuration is working correctly.</p>',
    })

    console.log('✅ Test email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email configuration test failed:', error.message)
    throw error
  }
}
