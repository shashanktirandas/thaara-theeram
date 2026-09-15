import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
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

  const { data: club, error: clubError } = await supabase
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

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) {
    return NextResponse.json(
      { error: 'Student profile not found.' },
      { status: 404 }
    )
  }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role, status')
    .eq('club_id', club.id)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  if (!membership || !['HEAD', 'COORDINATOR'].includes(membership.role)) {
    return NextResponse.json(
      { error: 'You do not have club management permission.' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    allowed: true,
    club: club.name,
    role: membership.role,
  })
}