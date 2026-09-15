import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated.' },
      { status: 401 }
    )
  }

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!student) {
    return NextResponse.json(
      { error: 'Student profile not found.' },
      { status: 404 }
    )
  }

  const { data: club } = await admin
    .from('clubs')
    .select('id, name, slug, status')
    .eq('slug', slug)
    .single()

  if (!club) {
    return NextResponse.json(
      { error: 'Club not found.' },
      { status: 404 }
    )
  }

  const { data: membership } = await admin
    .from('club_members')
    .select('role, status')
    .eq('club_id', club.id)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const { data: adminRole } = await admin
    .from('admin_roles')
    .select('status')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const allowed =
    !!adminRole ||
    membership?.role === 'HEAD' ||
    membership?.role === 'COORDINATOR'

  if (!allowed) {
    return NextResponse.json(
      { error: 'You do not have permission to manage applications.' },
      { status: 403 }
    )
  }

  const { data: applications, error } = await admin
  .from('club_applications')
  .select(`
    *,
    student:students!club_applications_student_id_fkey (
      id,
      name,
      roll_number,
      department,
      year,
      section,
      profile_photo_url
    )
  `)
    .eq('club_id', club.id)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Applications fetch error:', error)

    return NextResponse.json(
      { error: 'Unable to load applications.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    club: {
      id: club.id,
      name: club.name,
      slug: club.slug,
    },
    applications: applications ?? [],
  })
}