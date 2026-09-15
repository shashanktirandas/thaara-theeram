import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Please log in first.' },
        { status: 401 }
      )
    }

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json(
        { error: 'Student account not found.' },
        { status: 403 }
      )
    }

    const { data: club } = await supabase
      .from('clubs')
      .select('id, slug')
      .eq('slug', slug)
      .single()

    if (!club) {
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

    const isHead = membership?.role === 'HEAD'
    const isAdmin = !!adminRole

    if (!isHead && !isAdmin) {
      return NextResponse.json(
        {
          error:
            'Only the club Head or Platform Admin can edit club identity.',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : ''

    const category =
      typeof body.category === 'string'
        ? body.category.trim() || null
        : null

    const shortDescription =
      typeof body.short_description === 'string'
        ? body.short_description.trim() || null
        : null

    const description =
      typeof body.description === 'string'
        ? body.description.trim() || null
        : null

    const tagline =
      typeof body.tagline === 'string'
        ? body.tagline.trim() || null
        : null

    const vision =
      typeof body.vision === 'string'
        ? body.vision.trim() || null
        : null

    const mission =
      typeof body.mission === 'string'
        ? body.mission.trim() || null
        : null

    const activities =
      typeof body.activities === 'string'
        ? body.activities.trim() || null
        : null

    const bannerUrl =
      typeof body.banner_url === 'string'
        ? body.banner_url.trim() || null
        : null

    const whatsappGroupUrl =
      typeof body.whatsapp_group_url === 'string'
        ? body.whatsapp_group_url.trim() || null
        : null

    const instagramUrl =
      typeof body.instagram_url === 'string'
        ? body.instagram_url.trim() || null
        : null

    const linkedinUrl =
      typeof body.linkedin_url === 'string'
        ? body.linkedin_url.trim() || null
        : null

    const youtubeUrl =
      typeof body.youtube_url === 'string'
        ? body.youtube_url.trim() || null
        : null

    if (!name) {
      return NextResponse.json(
        { error: 'Club name is required.' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Club name is too long.' },
        { status: 400 }
      )
    }

    if (
      shortDescription &&
      shortDescription.length > 250
    ) {
      return NextResponse.json(
        {
          error:
            'Short description must be 250 characters or less.',
        },
        { status: 400 }
      )
    }

    const allowedCategories = [
      'Technical',
      'Cultural',
      'Arts & Media',
      'Sports',
      'Literary',
      'Social & Service',
      'Entrepreneurship',
      'Academic',
      'Other',
    ]

    if (
      category &&
      !allowedCategories.includes(category)
    ) {
      return NextResponse.json(
        { error: 'Invalid club category.' },
        { status: 400 }
      )
    }

    const { data: updatedClub, error: updateError } =
      await supabase
        .from('clubs')
        .update({
          name,
          category,
          short_description: shortDescription,
          description,
          tagline,
          vision,
          mission,
          activities,
          banner_url: bannerUrl,
          whatsapp_group_url: whatsappGroupUrl,
          instagram_url: instagramUrl,
          linkedin_url: linkedinUrl,
          youtube_url: youtubeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', club.id)
        .select(`
          id,
          name,
          slug,
          category,
          short_description,
          description,
          tagline,
          vision,
          mission,
          activities,
          banner_url,
          whatsapp_group_url,
          instagram_url,
          linkedin_url,
          youtube_url
        `)
        .single()

    if (updateError) {
      console.error(
        'Club identity update error:',
        updateError
      )

      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    await supabase.from('audit_logs').insert({
      actor_student_id: student.id,
      action: 'CLUB_IDENTITY_UPDATED',
      entity_type: 'CLUB',
      entity_id: club.id,
      metadata: {
        club_slug: club.slug,
      },
    })

    return NextResponse.json({
      success: true,
      club: updatedClub,
    })
  } catch (error) {
    console.error(
      'Club identity API error:',
      error
    )

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}