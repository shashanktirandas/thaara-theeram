import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = await createClient()
  const admin = createAdminClient()

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  // 2. Get the student's profile
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (studentError || !student) {
    return NextResponse.json(
      { error: 'Student profile not found.' },
      { status: 404 }
    )
  }

  // 3. Find the club
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
      { error: 'This club is not currently accepting applications.' },
      { status: 400 }
    )
  }

  // 4. Check whether the student is already an active member
  const { data: membership } = await admin
    .from('club_members')
    .select('role, status')
    .eq('club_id', club.id)
    .eq('student_id', student.id)
    .maybeSingle()

  if (membership?.status === 'ACTIVE') {
    return NextResponse.json({
      status: 'ALREADY_MEMBER',
      role: membership.role,
    })
  }

  // 5. Read optional application message
  let message: string | null = null

  try {
    const body = await request.json()
    if (typeof body?.message === 'string') {
      message = body.message.trim() || null
    }
  } catch {
    // No body is also valid.
  }

  // 6. Check for an existing pending application
  const { data: pendingApplication } = await admin
    .from('club_applications')
    .select('id')
    .eq('club_id', club.id)
    .eq('student_id', student.id)
    .eq('status', 'PENDING')
    .maybeSingle()

  if (pendingApplication) {
    return NextResponse.json({
      status: 'PENDING',
    })
  }

  // 7. Create the application
  const { error: applicationError } = await admin
    .from('club_applications')
    .insert({
      club_id: club.id,
      student_id: student.id,
      message,
      status: 'PENDING',
    })

  if (applicationError) {
    console.error('Join club application error:', applicationError)

    return NextResponse.json(
      { error: 'Unable to submit your application.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    status: 'PENDING',
  })
}