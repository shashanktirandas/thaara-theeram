import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { rollNumber, activationToken, password } = await request.json()

    if (
      !rollNumber ||
      typeof rollNumber !== 'string' ||
      !activationToken ||
      typeof activationToken !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Roll number, activation token, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, roll_number, name, college_email, auth_user_id')
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

    const tokenHash = createHash('sha256')
      .update(activationToken)
      .digest('hex')

    const { data: token, error: tokenError } = await supabase
      .from('activation_tokens')
      .select('id, student_id, expires_at, used_at')
      .eq('student_id', student.id)
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .maybeSingle()

    if (tokenError || !token) {
      return NextResponse.json(
        { error: 'Invalid activation session.' },
        { status: 400 }
      )
    }

    if (new Date(token.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'Activation session has expired. Please verify your OTP again.' },
        { status: 400 }
      )
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: student.college_email,
        password,
        email_confirm: true,
        user_metadata: {
          roll_number: student.roll_number,
          name: student.name,
        },
      })

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Could not create account.' },
        { status: 500 }
      )
    }

    const { error: linkError } = await supabase
      .from('students')
      .update({
        auth_user_id: authUser.user.id,
      })
      .eq('id', student.id)
      .is('auth_user_id', null)

    if (linkError) {
      await supabase.auth.admin.deleteUser(authUser.user.id)

      return NextResponse.json(
        { error: 'Could not link the account to the student record.' },
        { status: 500 }
      )
    }

    const { error: tokenUpdateError } = await supabase
      .from('activation_tokens')
      .update({
        used_at: new Date().toISOString(),
      })
      .eq('id', token.id)
      .is('used_at', null)

    if (tokenUpdateError) {
      return NextResponse.json(
        { error: 'Account created, but activation could not be completed.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully.',
      student: {
        name: student.name,
        rollNumber: student.roll_number,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}