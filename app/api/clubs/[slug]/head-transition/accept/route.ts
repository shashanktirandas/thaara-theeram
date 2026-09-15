import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { transitionRequestId } = await request.json()

    if (!transitionRequestId) {
      return NextResponse.json(
        { error: 'Transition request ID is required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
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

    const { data: result, error: transitionError } = await supabase.rpc(
      'accept_club_head_transition',
      {
        transition_request_id: transitionRequestId,
      }
    )

    if (transitionError) {
      return NextResponse.json(
        { error: transitionError.message },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Head transition accepted for ${club.name}.`,
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
      },
      result,
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}