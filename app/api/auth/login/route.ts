import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { rollNumber, password } = await request.json()

    if (
      !rollNumber ||
      typeof rollNumber !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Roll number and password are required.' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, roll_number, name, college_email, auth_user_id')
      .eq('roll_number', rollNumber.trim().toLowerCase())
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Invalid roll number or password.' },
        { status: 401 }
      )
    }

    if (!student.auth_user_id) {
      return NextResponse.json(
        { error: 'This account has not been activated yet.' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: student.college_email,
      password,
    })

    if (loginError) {
      return NextResponse.json(
        { error: 'Invalid roll number or password.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      student: {
        id: student.id,
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