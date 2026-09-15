import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOtp, hashOtp } from '@/lib/auth/otp'
import { sendBrevoEmail } from '@/lib/email/brevo'

export async function POST(request: Request) {
  try {
    const { rollNumber } = await request.json()

    if (!rollNumber || typeof rollNumber !== 'string') {
      return NextResponse.json(
        { error: 'Roll number is required.' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, name, college_email, auth_user_id')
      .eq('roll_number', rollNumber.trim().toLowerCase())
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student record not found.' },
        { status: 404 }
      )
    }

    if (!student.auth_user_id) {
      return NextResponse.json(
        { error: 'This account has not been activated yet.' },
        { status: 403 }
      )
    }

    // Invalidate previous unused password-reset OTPs.
    const { error: invalidateError } = await admin
      .from('verification_codes')
      .update({
        used_at: new Date().toISOString(),
      })
      .eq('student_id', student.id)
      .eq('purpose', 'PASSWORD_RESET')
      .is('used_at', null)

    if (invalidateError) {
      return NextResponse.json(
        { error: 'Could not reset the previous verification code.' },
        { status: 500 }
      )
    }

    const otp = generateOtp()
    const codeHash = hashOtp(otp)

    const { error: otpError } = await admin
      .from('verification_codes')
      .insert({
        student_id: student.id,
        purpose: 'PASSWORD_RESET',
        code_hash: codeHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
    
    if (otpError) {
      return NextResponse.json(
        { error: 'Could not create verification code.' },
        { status: 500 }
      )
    }

    try {
  await sendBrevoEmail({
    to: {
      email: student.college_email,
      name: student.name,
    },
    subject: 'Thaara Theeram – Password Reset Code',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 32px;">
        <h2 style="margin-bottom: 8px;">Password reset</h2>

        <p>Hello ${student.name},</p>

        <p>
          We received a request to reset your Thaara Theeram password.
        </p>

        <div style="margin: 28px 0; padding: 20px; background: #f5f7fb; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            YOUR VERIFICATION CODE
          </div>

          <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px;">
            ${otp}
          </div>
        </div>

        <p>
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <p style="color: #666; font-size: 13px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <hr style="margin: 28px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 13px; color: #777;">
          Thaara Theeram<br />
          A home for every passion
        </p>
      </div>
    `,
    textContent: `
Thaara Theeram – Password Reset

Hello ${student.name},

Your password reset verification code is:

${otp}

This code expires in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Thaara Theeram
A home for every passion
    `.trim(),
    tag: 'password-reset',
  })
} catch {
  await admin
    .from('verification_codes')
    .update({
      used_at: new Date().toISOString(),
    })
    .eq('student_id', student.id)
    .eq('purpose', 'PASSWORD_RESET')
    .eq('code_hash', codeHash)
    .is('used_at', null)

  return NextResponse.json(
    { error: 'Could not send verification email. Please try again.' },
    { status: 502 }
  )
}

    return NextResponse.json({
  success: true,
  message: 'Verification code sent to your college email.',
  student: {
    name: student.name,
    collegeEmail: student.college_email,
  },
})
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}