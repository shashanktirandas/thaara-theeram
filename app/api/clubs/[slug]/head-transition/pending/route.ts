import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const { data: requestRow, error: requestError } = await admin
      .from('club_head_transition_requests')
      .select(`
        id,
        current_head_id,
        proposed_head_id,
        status,
        requested_at,
        current_head:students!club_head_transition_requests_current_head_id_fkey (
          id,
          name,
          roll_number
        ),
        proposed_head:students!club_head_transition_requests_proposed_head_id_fkey (
          id,
          name,
          roll_number
        )
      `)
      .eq('club_id', club.id)
      .eq('proposed_head_id', student.id)
      .eq('status', 'PENDING')
      .maybeSingle()

    if (requestError) {
      console.error('Pending Head transition fetch error:', requestError)

      return NextResponse.json(
        { error: requestError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      request: requestRow ?? null,
    })
  } catch (error) {
    console.error('Pending Head transition error:', error)

    return NextResponse.json(
      { error: 'Failed to load pending Head transition.' },
      { status: 500 }
    )
  }
}