import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated.' },
      { status: 401 }
    )
  }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, roll_number, name, department, year, section')
    .eq('auth_user_id', user.id)
    .single()

  if (studentError || !student) {
    return NextResponse.json(
      { error: 'Student profile not found.' },
      { status: 404 }
    )
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('club_members')
    .select(`
      club_id,
      role,
      status,
      clubs (
        id,
        name,
        slug
      )
    `)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')

  if (membershipError) {
    return NextResponse.json(
      { error: 'Could not load club roles.' },
      { status: 500 }
    )
  }

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('status')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  return NextResponse.json({
    authenticated: true,
    student,
    isAdmin: !!adminRole,
    memberships,
  })
}