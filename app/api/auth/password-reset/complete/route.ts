import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { rollNumber, resetToken, password } = await request.json()

    if (
      !rollNumber ||
      typeof rollNumber !== 'string' ||
      !resetToken ||
      typeof resetToken !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Roll number, reset token, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, auth_user_id')
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

    const tokenHash = createHash('sha256')
      .update(resetToken)
      .digest('hex')

    const { data: token, error: tokenError } = await admin
      .from('activation_tokens')
      .select('id, student_id, expires_at, used_at')
      .eq('student_id', student.id)
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .maybeSingle()

    if (tokenError || !token) {
      return NextResponse.json(
        { error: 'Invalid password reset session.' },
        { status: 400 }
      )
    }

    if (new Date(token.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'Password reset session has expired. Please verify your OTP again.' },
        { status: 400 }
      )
    }

    const { error: passwordError } =
      await admin.auth.admin.updateUserById(student.auth_user_id, {
        password,
      })

    if (passwordError) {
      return NextResponse.json(
        { error: 'Could not update password.' },
        { status: 500 }
      )
    }

    const { error: tokenUpdateError } = await admin
      .from('activation_tokens')
      .update({
        used_at: new Date().toISOString(),
      })
      .eq('id', token.id)
      .is('used_at', null)

    if (tokenUpdateError) {
      return NextResponse.json(
        {
          error:
            'Password was changed, but the reset session could not be closed.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}