import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    // Find the logged-in student's profile.
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    // Find the club.
    const { data: club, error: clubError } = await admin
      .from('clubs')
      .select('id, name, slug, status')
      .eq('slug', slug)
      .single()

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    if (club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This club is not currently active.' },
        { status: 400 }
      )
    }

    // Find the student's active membership.
    const { data: membership, error: membershipError } = await admin
      .from('club_members')
      .select('id, role, status')
      .eq('club_id', club.id)
      .eq('student_id', student.id)
      .maybeSingle()

    if (membershipError) {
      console.error('Leave club membership lookup error:', membershipError)

      return NextResponse.json(
        { error: 'Unable to verify your club membership.' },
        { status: 500 }
      )
    }

    if (!membership || membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'You are not an active member of this club.' },
        { status: 400 }
      )
    }

    // The Head must transfer Headship before leaving.
    if (membership.role === 'HEAD') {
      return NextResponse.json(
        {
          error:
            'The current Head cannot leave the club. Transfer Headship first.',
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Keep the membership row for history.
    const { error: updateError } = await admin
      .from('club_members')
      .update({
        status: 'INACTIVE',
        left_at: now,
        updated_at: now,
      })
      .eq('id', membership.id)
      .eq('club_id', club.id)
      .eq('student_id', student.id)

    if (updateError) {
      console.error('Leave club update error:', updateError)

      return NextResponse.json(
        { error: 'Unable to leave the club.' },
        { status: 500 }
      )
    }

    // Notify active club management.
    const { data: managers } = await admin
      .from('club_members')
      .select('student_id, role')
      .eq('club_id', club.id)
      .eq('status', 'ACTIVE')
      .in('role', ['HEAD', 'COORDINATOR'])

    const notifications = (managers ?? [])
      .filter((manager) => manager.student_id !== student.id)
      .map((manager) => ({
        student_id: manager.student_id,
        club_id: club.id,
        type: 'CLUB_MEMBERSHIP',
        title: `Member left ${club.name}`,
        message: `${student.name} has left ${club.name}.`,
      }))

    if (notifications.length > 0) {
      const { error: notificationError } = await admin
        .from('notifications')
        .insert(notifications)

      if (notificationError) {
        console.error(
          'Leave club notification error:',
          notificationError
        )
      }
    }

    // Record the action.
    const { error: auditError } = await admin
      .from('audit_logs')
      .insert({
        actor_student_id: student.id,
        action: 'CLUB_MEMBER_LEFT',
        entity_type: 'CLUB_MEMBER',
        entity_id: membership.id,
        metadata: {
          club_id: club.id,
          student_id: student.id,
          student_name: student.name,
          previous_role: membership.role,
        },
      })

    if (auditError) {
      console.error('Leave club audit error:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: `You have left ${club.name}.`,
    })
  } catch (error) {
    console.error('Leave club route error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}