import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function cleanList(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

async function getCurrentStudent() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      supabase,
      user: null,
      student: null,
    }
  }

  const { data: student, error } = await supabase
    .from('students')
    .select(`
      id,
      auth_user_id,
      roll_number,
      name,
      college_email,
      department,
      year,
      section,
      profile_photo_url,
      bio,
      interests,
      skills
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (error || !student) {
    return {
      supabase,
      user,
      student: null,
    }
  }

  return {
    supabase,
    user,
    student,
  }
}

export async function GET() {
  try {
    const { user, student } = await getCurrentStudent()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    const { data: memberships, error: membershipError } = await admin
      .from('club_members')
      .select(`
        id,
        role,
        status,
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
      console.error('Profile membership error:', membershipError)

      return NextResponse.json(
        { error: 'Unable to load club memberships.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      student: {
        id: student.id,
        roll_number: student.roll_number,
        name: student.name,
        college_email: student.college_email,
        department: student.department,
        year: student.year,
        section: student.section,
        profile_photo_url: student.profile_photo_url,
        bio: student.bio,
        interests: student.interests ?? [],
        skills: student.skills ?? [],
      },
      memberships: memberships ?? [],
    })
  } catch (error) {
    console.error('Profile GET error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, student } = await getCurrentStudent()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const body = await request.json()

    const bio = cleanString(body.bio, 500)

    const interests = cleanList(
      body.interests,
      20,
      50
    )

    const skills = cleanList(
      body.skills,
      20,
      50
    )

    const admin = createAdminClient()

    const { data: updatedStudent, error } = await admin
      .from('students')
      .update({
        bio: bio || null,
        interests,
        skills,
      })
      .eq('id', student.id)
      .eq('auth_user_id', user.id)
      .select(`
        id,
        roll_number,
        name,
        college_email,
        department,
        year,
        section,
        profile_photo_url,
        bio,
        interests,
        skills
      `)
      .single()

    if (error || !updatedStudent) {
      console.error('Profile update error:', error)

      return NextResponse.json(
        { error: 'Unable to update profile.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      student: updatedStudent,
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)

    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}