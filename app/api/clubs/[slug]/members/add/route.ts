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

    const rollNumber = String(body.rollNumber ?? '').trim()

    if (!rollNumber) {
      return NextResponse.json(
        { error: 'Roll number is required.' },
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

    const { data: currentStudent, error: studentError } = await supabase
      .from('students')
      .select('id')
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

    if (clubError || !club || club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { data: currentMembership } = await admin
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
      currentMembership?.role === 'HEAD' ||
      currentMembership?.role === 'COORDINATOR'

    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to add members.' },
        { status: 403 }
      )
    }

    const { data: targetStudent, error: targetError } = await admin
      .from('students')
      .select('id, name, roll_number')
      .eq('roll_number', rollNumber)
      .single()

    if (targetError || !targetStudent) {
      return NextResponse.json(
        { error: 'No student was found with that roll number.' },
        { status: 404 }
      )
    }

    const { data: existingMembership } = await admin
      .from('club_members')
      .select('id, role, status')
      .eq('club_id', club.id)
      .eq('student_id', targetStudent.id)
      .maybeSingle()

    if (existingMembership?.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'This student is already a member of the club.' },
        { status: 409 }
      )
    }

    let membership

    if (existingMembership) {
      const { data, error } = await admin
        .from('club_members')
        .update({
          status: 'ACTIVE',
          role: 'MEMBER',
          joined_at: new Date().toISOString(),
          left_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMembership.id)
        .select('id, role, status')
        .single()

      if (error) {
        console.error('Reactivate member error:', error)

        return NextResponse.json(
          { error: 'Unable to add the student.' },
          { status: 500 }
        )
      }

      membership = data
    } else {
      const { data, error } = await admin
        .from('club_members')
        .insert({
          club_id: club.id,
          student_id: targetStudent.id,
          role: 'MEMBER',
          status: 'ACTIVE',
        })
        .select('id, role, status')
        .single()

      if (error) {
        console.error('Add member error:', error)

        return NextResponse.json(
          { error: 'Unable to add the student.' },
          { status: 500 }
        )
      }

      membership = data
    }

    await admin.from('notifications').insert({
        student_id: targetStudent.id,
        club_id: club.id,
        type: 'CLUB_MEMBERSHIP',
        title: `Added to ${club.name}`,
        message: `You have been added as a member of ${club.name}.`,
      })

    await admin.from('audit_logs').insert({
      actor_student_id: currentStudent.id,
      action: 'CLUB_MEMBER_ADDED',
      entity_type: 'CLUB_MEMBER',
      entity_id: membership.id,
      metadata: {
        club_id: club.id,
        student_id: targetStudent.id,
        role: 'MEMBER',
      },
    })

    return NextResponse.json({
      success: true,
      message: `${targetStudent.name} has been added to ${club.name}.`,
      member: {
        id: membership.id,
        name: targetStudent.name,
        roll_number: targetStudent.roll_number,
        role: membership.role,
        status: membership.status,
      },
    })
  } catch (error) {
    console.error('Add member route error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}