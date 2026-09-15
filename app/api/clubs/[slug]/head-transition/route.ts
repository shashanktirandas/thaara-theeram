import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { proposedHeadId } = await request.json()

    if (!proposedHeadId || typeof proposedHeadId !== 'string') {
      return NextResponse.json(
        { error: 'Proposed Coordinator is required.' },
        { status: 400 }
      )
    }

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

    const { data: currentStudent, error: studentError } = await supabase
      .from('students')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single()

    if (studentError || !currentStudent) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

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
        { error: 'This club is not active.' },
        { status: 400 }
      )
    }

    const { data: currentHead, error: headError } = await admin
  .from('club_members')
  .select('id, role, status')
  .eq('club_id', club.id)
  .eq('student_id', currentStudent.id)
  .eq('role', 'HEAD')
  .eq('status', 'ACTIVE')
  .maybeSingle()

if (headError) {
  return NextResponse.json(
    { error: 'Could not verify club leadership.' },
    { status: 500 }
  )
}

const { data: adminRole, error: adminRoleError } = await admin
  .from('admin_roles')
  .select('id')
  .eq('student_id', currentStudent.id)
  .eq('status', 'ACTIVE')
  .maybeSingle()

if (adminRoleError) {
  return NextResponse.json(
    { error: 'Could not verify administrator access.' },
    { status: 500 }
  )
}

const isAdmin = !!adminRole
const isCurrentHead = !!currentHead

if (!isCurrentHead && !isAdmin) {
  return NextResponse.json(
    {
      error:
        'Only the current Club Head or a platform Admin can request a Head transition.',
    },
    { status: 403 }
  )
}
    if (proposedHeadId === currentStudent.id) {
      return NextResponse.json(
        { error: 'You are already the current Head.' },
        { status: 400 }
      )
    }

    const { data: proposedCoordinator, error: coordinatorError } =
      await admin
        .from('club_members')
        .select('id, student_id, role, status')
        .eq('club_id', club.id)
        .eq('student_id', proposedHeadId)
        .eq('role', 'COORDINATOR')
        .eq('status', 'ACTIVE')
        .maybeSingle()

    if (coordinatorError) {
      return NextResponse.json(
        { error: 'Could not verify the proposed Coordinator.' },
        { status: 500 }
      )
    }

    if (!proposedCoordinator) {
      return NextResponse.json(
        {
          error:
            'The proposed student must be an active Coordinator of this club.',
        },
        { status: 400 }
      )
    }

    const { data: proposedStudent, error: proposedStudentError } =
      await admin
        .from('students')
        .select('id, name')
        .eq('id', proposedHeadId)
        .single()

    if (proposedStudentError || !proposedStudent) {
      return NextResponse.json(
        { error: 'Proposed Coordinator student record not found.' },
        { status: 404 }
      )
    }

    const { data: existingRequest, error: existingError } = await admin
      .from('club_head_transition_requests')
      .select('id')
      .eq('club_id', club.id)
      .eq('status', 'PENDING')
      .maybeSingle()

    if (existingError) {
      return NextResponse.json(
        { error: 'Could not check existing transition requests.' },
        { status: 500 }
      )
    }

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            'This club already has a pending Head transition request.',
        },
        { status: 409 }
      )
    }

    const { data: transitionRequest, error: transitionError } =
      await admin
        .from('club_head_transition_requests')
        .insert({
          club_id: club.id,
          current_head_id: currentStudent.id,
          proposed_head_id: proposedHeadId,
          status: 'PENDING',
        })
        .select('id, status, requested_at')
        .single()

    if (transitionError || !transitionRequest) {
      return NextResponse.json(
        { error: 'Could not create the Head transition request.' },
        { status: 500 }
      )
    }

    const { error: notificationError } = await admin
            .from('notifications')
            .insert({
              student_id: proposedHeadId,
              club_id: club.id,
              type: 'HEAD_TRANSITION_REQUEST',
              title: `Head transition request — ${club.name}`,
              message: `${currentStudent.name} has requested you to become the new Head of ${club.name}.`,
            })

    if (notificationError) {
      console.error(
        'Head transition notification failed:',
        notificationError
      )
    }

    const { error: auditError } = await admin
      .from('audit_logs')
      .insert({
        actor_student_id: currentStudent.id,
        action: 'CLUB_HEAD_TRANSFER_REQUESTED',
        entity_type: 'CLUB',
        entity_id: club.id,
        metadata: {
          transition_request_id: transitionRequest.id,
          current_head_id: currentStudent.id,
          proposed_head_id: proposedHeadId,
        },
      })

    if (auditError) {
      console.error('Head transition audit failed:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: `Head transition request sent to ${proposedStudent.name}.`,
      request: transitionRequest,
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}