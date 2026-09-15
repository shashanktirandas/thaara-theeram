import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RouteContext = {
  params: Promise<{
    roll_number: string
  }>
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { roll_number } = await params

    const rollNumber = decodeURIComponent(roll_number)
      .trim()
      .toLowerCase()

    if (!rollNumber) {
      return NextResponse.json(
        { error: 'Student not found.' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    const { data: student, error: studentError } = await admin
      .from('students')
      .select(`
        id,
        roll_number,
        name,
        department,
        year,
        section,
        profile_photo_url,
        bio,
        interests,
        skills
      `)
      .eq('roll_number', rollNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found.' },
        { status: 404 }
      )
    }

    const { data: memberships, error: membershipError } = await admin
      .from('club_members')
      .select(`
        id,
        role,
        joined_at,
        clubs (
          id,
          name,
          slug,
          category,
          logo_url,
          status
        )
      `)
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .order('joined_at', { ascending: true })

    if (membershipError) {
      console.error(
        'Public profile membership error:',
        membershipError
      )

      return NextResponse.json(
        { error: 'Unable to load student profile.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      student: {
        id: student.id,
        roll_number: student.roll_number,
        name: student.name,
        department: student.department,
        year: student.year,
        section: student.section,
        profile_photo_url: student.profile_photo_url,
        bio: student.bio ?? '',
        interests: Array.isArray(student.interests)
          ? student.interests
          : [],
        skills: Array.isArray(student.skills)
          ? student.skills
          : [],
      },
      memberships: memberships ?? [],
    })
  } catch (error) {
    console.error('Public profile error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}