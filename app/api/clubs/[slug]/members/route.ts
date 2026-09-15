import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

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

  const { data: club, error: clubError } = await admin
    .from('clubs')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (clubError || !club) {
    return NextResponse.json(
      { error: 'Club not found.' },
      { status: 404 }
    )
  }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', club.id)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('id')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const allowed =
    adminRole ||
    membership?.role === 'HEAD' ||
    membership?.role === 'COORDINATOR'

  if (!allowed) {
    return NextResponse.json(
      { error: 'You do not have permission to view club members.' },
      { status: 403 }
    )
  }

  const { data: members, error: membersError } = await admin
    .from('club_members')
    .select(`
      id,
      role,
      status,
      joined_at,
      student:students!club_members_student_id_fkey (
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
    .eq('status', 'ACTIVE')
    .order('role', { ascending: true })

  if (membersError) {
    console.error('Members fetch error:', membersError)

    return NextResponse.json(
      { error: membersError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    club: {
      id: club.id,
      name: club.name,
      slug: club.slug,
    },
    members: members ?? [],
  })
}