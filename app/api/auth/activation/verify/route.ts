import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashOtp } from '@/lib/auth/otp'

export async function POST(request: Request) {
  try {
    const { rollNumber, otp } = await request.json()

    if (
      !rollNumber ||
      typeof rollNumber !== 'string' ||
      !otp ||
      typeof otp !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Roll number and OTP are required.' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: student, error: studentError } = await supabase
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

    if (student.auth_user_id) {
      return NextResponse.json(
        { error: 'This account is already activated.' },
        { status: 409 }
      )
    }

    const { data: verificationCode, error: codeError } = await supabase
      .from('verification_codes')
      .select('id, code_hash, expires_at, attempts, used_at')
      .eq('student_id', student.id)
      .eq('purpose', 'ACCOUNT_ACTIVATION')
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (codeError || !verificationCode) {
      return NextResponse.json(
        { error: 'No active verification code found.' },
        { status: 400 }
      )
    }

    if (new Date(verificationCode.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'This OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (verificationCode.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    const isValid = hashOtp(otp) === verificationCode.code_hash

    if (!isValid) {
      const { error: attemptError } = await supabase
        .from('verification_codes')
        .update({
          attempts: verificationCode.attempts + 1,
        })
        .eq('id', verificationCode.id)

      if (attemptError) {
        return NextResponse.json(
          { error: 'Could not update verification attempt.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid OTP.' },
        { status: 400 }
      )
    }

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const { error: tokenError } = await supabase
      .from('activation_tokens')
      .insert({
        student_id: student.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })

    if (tokenError) {
      return NextResponse.json(
        { error: 'Could not create activation session.' },
        { status: 500 }
      )
    }

    const { error: usedError } = await supabase
      .from('verification_codes')
      .update({
        used_at: new Date().toISOString(),
      })
      .eq('id', verificationCode.id)
      .is('used_at', null)

    if (usedError) {
      await supabase
        .from('activation_tokens')
        .delete()
        .eq('token_hash', tokenHash)

      return NextResponse.json(
        { error: 'Could not complete OTP verification.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      activationToken: rawToken,
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