import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    const decision = body.decision

    if (decision !== 'APPROVE' && decision !== 'REJECT') {
      return NextResponse.json(
        { error: 'Invalid decision.' },
        { status: 400 }
      )
    }

    const { supabase, student } = await requireAdmin()

    if (!student) {
      return NextResponse.json(
        { error: 'Admin student account not found.' },
        { status: 403 }
      )
    }

    const functionName =
      decision === 'APPROVE'
        ? 'approve_club_request'
        : 'reject_club_request'

    const { data, error } = await supabase.rpc(functionName, {
      p_request_id: id,
      p_admin_student_id: student.id,
    })

    if (error) {
      console.error('Club request decision error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      decision,
      result: data,
    })
  } catch (error) {
    console.error('Club request decision error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}