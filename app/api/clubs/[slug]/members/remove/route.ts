import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const memberId = String(body.memberId ?? '').trim()

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required.' },
        { status: 400 }
      )
    }

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

    const { data: currentStudent } = await supabase
      .from('students')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!currentStudent) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    const { data: club } = await admin
      .from('clubs')
      .select('id, name, status')
      .eq('slug', slug)
      .single()

    if (!club || club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { data: actorMembership } = await admin
      .from('club_members')
      .select('role, status')
      .eq('club_id', club.id)
      .eq('student_id', currentStudent.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const { data: adminRole } = await admin
      .from('admin_roles')
      .select('id')
      .eq('student_id', currentStudent.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const canManage =
      adminRole !== null ||
      actorMembership?.role === 'HEAD'

    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members.' },
        { status: 403 }
      )
    }

    const { data: membership } = await admin
      .from('club_members')
      .select(`
        id,
        student_id,
        role,
        status,
        student:students!club_members_student_id_fkey (
          id,
          name,
          roll_number
        )
      `)
      .eq('id', memberId)
      .eq('club_id', club.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Club member not found.' },
        { status: 404 }
      )
    }

    if (membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This member is already inactive.' },
        { status: 409 }
      )
    }

    if (membership.role === 'HEAD') {
      return NextResponse.json(
        { error: 'The current Head cannot be removed. Transfer Headship first.' },
        { status: 400 }
      )
    }

    if (membership.student_id === currentStudent.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the club.' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const { error: updateError } = await admin
      .from('club_members')
      .update({
        status: 'INACTIVE',
        left_at: now,
        updated_at: now,
      })
      .eq('id', memberId)

    if (updateError) {
      console.error('Remove member error:', updateError)

      return NextResponse.json(
        { error: 'Unable to remove the member.' },
        { status: 500 }
      )
    }

    const targetStudent = Array.isArray(membership.student)
      ? membership.student[0]
      : membership.student

    await admin.from('notifications').insert({
      student_id: targetStudent.id,
      club_id: club.id,
      type: 'CLUB_MEMBERSHIP',
      title: `Removed from ${club.name}`,
      message: `You have been removed from ${club.name}.`,
    })

    await admin.from('audit_logs').insert({
      actor_student_id: currentStudent.id,
      action: 'CLUB_MEMBER_REMOVED',
      entity_type: 'CLUB_MEMBER',
      entity_id: membership.id,
      metadata: {
        club_id: club.id,
        student_id: membership.student_id,
        student_name: targetStudent?.name ?? null,
        roll_number: targetStudent?.roll_number ?? null,
        previous_role: membership.role,
      },
    })

    return NextResponse.json({
      success: true,
      message: `${targetStudent?.name ?? 'Member'} has been removed from ${club.name}.`,
    })
  } catch (error) {
    console.error('Remove member route error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}