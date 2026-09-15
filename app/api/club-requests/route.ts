import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Please log in first.' },
        { status: 401 }
      )
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, roll_number')
      .eq('auth_user_id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student account not found.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const clubName = body.club_name?.trim()
    const category = body.category?.trim()
    const description = body.description?.trim()
    const reason = body.reason?.trim()
    const reapplyId = body.reapply_id?.trim()
    if (!clubName || !category || !description || !reason) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Prevent duplicate pending request for the same club name
    if (reapplyId) {
  const { data: previousRequest, error: previousRequestError } =
    await admin
      .from('club_requests')
      .select('id, requested_by, status')
      .eq('id', reapplyId)
      .eq('requested_by', student.id)
      .single()

  if (previousRequestError || !previousRequest) {
    return NextResponse.json(
      { error: 'Previous club request not found.' },
      { status: 404 }
    )
  }

  if (previousRequest.status !== 'REJECTED') {
    return NextResponse.json(
      { error: 'Only rejected requests can be reapplied.' },
      { status: 400 }
    )
  }
}
    const { data: existingRequest } = await admin
        .from('club_requests')
        .select('id')
        .ilike('club_name', clubName)
        .eq('status', 'PENDING')
        .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending request already exists for this club.' },
        { status: 409 }
      )
    }

    // Create request.
    // The student who submits the request is automatically
    // the requester and will become the initial Head if approved.
    const { data: newRequest, error: insertError } = await admin
      .from('club_requests')
      .insert({
        requested_by: student.id,
        club_name: clubName,
        category,
        description,
        reason,
        status: 'PENDING',
      })
      .select('id, club_name, status, created_at, requested_by')
      .single()

    if (insertError) {
      console.error('Club request insert error:', insertError)

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    // Audit
    await admin.from('audit_logs').insert({
      actor_student_id: student.id,
      action: 'CLUB_REQUEST_CREATED',
      entity_type: 'CLUB_REQUEST',
      entity_id: newRequest.id,
      metadata: {
        club_name: clubName,
        category,
        requested_by: student.roll_number,
      },
    })

    return NextResponse.json({
      success: true,
      request: newRequest,
    })
  } catch (error) {
    console.error('Club request creation error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Please log in first.' },
        { status: 401 }
      )
    }

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

    const { data: requests, error } = await supabase
      .from('club_requests')
      .select(
        'id, club_name, category, description, reason, status, created_at, reviewed_at'
      )
      .eq('requested_by', student.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Club request fetch error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      requests: requests ?? [],
    })
  } catch (error) {
    console.error('Club request fetch error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}