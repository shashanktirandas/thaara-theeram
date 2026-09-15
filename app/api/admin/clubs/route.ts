import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    // Find student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student account not found.' },
        { status: 403 }
      )
    }

    // Verify Admin
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    if (adminError || !adminRole) {
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      )
    }

    // Admin client
    const admin = createAdminClient()

    const { data: clubs, error: clubsError } = await admin
        .from('clubs')
        .select(`
          id,
          name,
          slug,
          category,
          short_description,
          status,
          created_at
        `)
        .in('status', ['ACTIVE', 'ARCHIVED'])
        .order('created_at', { ascending: false })

    if (clubsError) {
      return NextResponse.json(
        { error: clubsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clubs: clubs ?? [],
    })
  } catch (error) {
    console.error('Admin clubs GET error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}