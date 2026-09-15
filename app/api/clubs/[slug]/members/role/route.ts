import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
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

  const body = await request.json()

  const memberId = body.memberId
  const newRole = body.newRole

  if (!memberId || !['MEMBER', 'COORDINATOR'].includes(newRole)) {
    return NextResponse.json(
      { error: 'Invalid member or role.' },
      { status: 400 }
    )
  }

  // Verify that the member belongs to this club.
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!club) {
    return NextResponse.json(
      { error: 'Club not found.' },
      { status: 404 }
    )
  }

  const { data: member } = await supabase
    .from('club_members')
    .select('id, club_id')
    .eq('id', memberId)
    .eq('club_id', club.id)
    .maybeSingle()

  if (!member) {
    return NextResponse.json(
      { error: 'Member not found in this club.' },
      { status: 404 }
    )
  }

  // Final authorization is enforced inside the database function.
  const { error: roleError } = await supabase.rpc(
    'update_club_member_role',
    {
      member_id: memberId,
      new_role: newRole,
    }
  )

  if (roleError) {
    console.error('Role update error:', roleError)

    return NextResponse.json(
      { error: roleError.message },
      { status: 403 }
    )
  }

  return NextResponse.json({
    success: true,
    memberId,
    role: newRole,
  })
}