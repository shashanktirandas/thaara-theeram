import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { transitionRequestId } = body

    if (!transitionRequestId) {
      return NextResponse.json(
        { error: 'Transition request ID is required.' },
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

    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single()

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { error } = await supabase.rpc(
      'reject_club_head_transition',
      {
        transition_request_id: transitionRequestId,
      }
    )

    if (error) {
      console.error('Reject head transition error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Headship transfer request rejected.',
    })
  } catch (error) {
    console.error('Reject head transition route error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}