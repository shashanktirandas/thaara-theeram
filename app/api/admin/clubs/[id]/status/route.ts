import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient()

    // ---------------------------------------------
    // Check logged-in user
    // ---------------------------------------------

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

    // ---------------------------------------------
    // Find the student account
    // ---------------------------------------------

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

    // ---------------------------------------------
    // Verify platform Admin
    // ---------------------------------------------

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

    // ---------------------------------------------
    // Read requested status
    // ---------------------------------------------

    const body = await request.json()

    const status = body.status

    if (status !== 'ACTIVE' && status !== 'ARCHIVED') {
      return NextResponse.json(
        { error: 'Invalid club status.' },
        { status: 400 }
      )
    }

    const { id } = await params

    // ---------------------------------------------
    // Admin database client
    // ---------------------------------------------

    const admin = createAdminClient()

    // ---------------------------------------------
    // Make sure club exists
    // ---------------------------------------------

    const { data: club, error: clubError } = await admin
      .from('clubs')
      .select('id, name, status')
      .eq('id', id)
      .single()

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    // ---------------------------------------------
    // Update status
    // ---------------------------------------------

    const { data: updatedClub, error: updateError } = await admin
      .from('clubs')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, name, slug, status')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // ---------------------------------------------
    // Audit log
    // ---------------------------------------------

    await admin.from('audit_logs').insert({
      actor_student_id: student.id,
      action:
        status === 'ARCHIVED'
          ? 'CLUB_ARCHIVED'
          : 'CLUB_RESTORED',
      entity_type: 'CLUB',
      entity_id: club.id,
      metadata: {
        club_name: club.name,
        previous_status: club.status,
        new_status: status,
      },
    })

    return NextResponse.json({
      success: true,
      club: updatedClub,
    })
  } catch (error) {
    console.error('Admin club status error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}