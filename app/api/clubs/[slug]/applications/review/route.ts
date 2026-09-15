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

  const applicationId = body?.applicationId
  const decision = body?.decision

  if (
    typeof applicationId !== 'string' ||
    !['APPROVE', 'REJECT'].includes(decision)
  ) {
    return NextResponse.json(
      { error: 'Invalid application review request.' },
      { status: 400 }
    )
  }

  // Verify that the application belongs to this club.
  const { data: application } = await supabase
    .from('club_applications')
    .select(`
      id,
      club_id,
      clubs (
        slug
      )
    `)
    .eq('id', applicationId)
    .maybeSingle()

  if (!application) {
    return NextResponse.json(
      { error: 'Application not found.' },
      { status: 404 }
    )
  }

  const applicationClub = Array.isArray(application.clubs)
    ? application.clubs[0]
    : application.clubs

  if (!applicationClub || applicationClub.slug !== slug) {
    return NextResponse.json(
      { error: 'Application does not belong to this club.' },
      { status: 400 }
    )
  }

  // Authorization is enforced again inside the database function.
  const { error: reviewError } = await supabase.rpc(
  'review_club_application',
    {
      application_id: applicationId,
      decision,
    }
  )

  if (reviewError) {
    console.error('Application review error:', reviewError)

    return NextResponse.json(
      { error: reviewError.message },
      { status: 403 }
    )
  }

  return NextResponse.json({
    success: true,
    status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
  })
}