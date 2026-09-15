import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VISIBILITIES = ['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'] as const

type Visibility = (typeof VISIBILITIES)[number]

function isVisibility(value: unknown): value is Visibility {
  return (
    typeof value === 'string' &&
    VISIBILITIES.includes(value as Visibility)
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name, slug, status')
      .eq('slug', slug)
      .single()

    if (clubError || !club || club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    /*
     * Determine what this viewer is allowed to see.
     *
     * Visitor:
     *   PUBLIC
     *
     * Active club member:
     *   PUBLIC + MEMBERS_ONLY
     *
     * Head / Coordinator / Admin:
     *   PUBLIC + MEMBERS_ONLY + PRIVATE
     */
    let allowedVisibility: Visibility[] = ['PUBLIC']

    if (user) {
      const admin = createAdminClient()

      const { data: student } = await admin
        .from('students')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (student) {
        const { data: membership } = await admin
          .from('club_members')
          .select('role')
          .eq('club_id', club.id)
          .eq('student_id', student.id)
          .eq('status', 'ACTIVE')
          .maybeSingle()

        const { data: adminRole } = await admin
          .from('admin_roles')
          .select('id')
          .eq('student_id', student.id)
          .eq('status', 'ACTIVE')
          .maybeSingle()

        const isManager =
          adminRole !== null ||
          membership?.role === 'HEAD' ||
          membership?.role === 'COORDINATOR'

        if (isManager) {
          allowedVisibility = [
            'PUBLIC',
            'MEMBERS_ONLY',
            'PRIVATE',
          ]
        } else if (membership) {
          allowedVisibility = [
            'PUBLIC',
            'MEMBERS_ONLY',
          ]
        }
      }
    }

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        visibility,
        created_at,
        updated_at,
        created_by,
        creator:students!announcements_created_by_fkey (
          id,
          name,
          roll_number
        )
      `)
      .eq('club_id', club.id)
      .in('visibility', allowedVisibility)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get announcements error:', error)

      return NextResponse.json(
        { error: 'Failed to load announcements.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
      },
      announcements: announcements ?? [],
    })
  } catch (error) {
    console.error('Announcements GET error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    const title = String(body.title ?? '').trim()
    const content = String(body.content ?? '').trim()
    const visibility = String(
      body.visibility ?? 'PUBLIC'
    ).toUpperCase()

    if (!title) {
      return NextResponse.json(
        { error: 'Announcement title is required.' },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Announcement content is required.' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Announcement title is too long.' },
        { status: 400 }
      )
    }

    if (!isVisibility(visibility)) {
      return NextResponse.json(
        { error: 'Invalid announcement visibility.' },
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

    const { data: student } = await supabase
      .from('students')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    const { data: club, error: clubError } = await admin
      .from('clubs')
      .select('id, name, slug, status')
      .eq('slug', slug)
      .single()

    if (clubError || !club || club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { data: membership } = await admin
      .from('club_members')
      .select('role, status')
      .eq('club_id', club.id)
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const { data: adminRole } = await admin
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const canManage =
      adminRole !== null ||
      membership?.role === 'HEAD' ||
      membership?.role === 'COORDINATOR'

    if (!canManage) {
      return NextResponse.json(
        {
          error:
            'You do not have permission to create announcements.',
        },
        { status: 403 }
      )
    }

    const { data: announcement, error: insertError } =
      await admin
        .from('announcements')
        .insert({
          club_id: club.id,
          created_by: student.id,
          title,
          content,
          visibility,
        })
        .select(`
          id,
          title,
          content,
          visibility,
          created_at,
          updated_at,
          created_by
        `)
        .single()

    if (insertError) {
      console.error(
        'Create announcement error:',
        insertError
      )

      return NextResponse.json(
        { error: 'Failed to create announcement.' },
        { status: 500 }
      )
    }

    /*
     * Only notify members about announcements they are
     * actually allowed to know about.
     *
     * PRIVATE announcements are management-only,
     * so regular members should not receive notifications.
     */
    if (visibility !== 'PRIVATE') {
      const { data: activeMembers } = await admin
        .from('club_members')
        .select('student_id')
        .eq('club_id', club.id)
        .eq('status', 'ACTIVE')

      const notifications = (activeMembers ?? [])
        .filter(
          (member) => member.student_id !== student.id
        )
        .map((member) => ({
            student_id: member.student_id,
            club_id: club.id,
            type: 'CLUB_ANNOUNCEMENT',
            title: `New announcement from ${club.name}`,
            message: title,
          }))

      if (notifications.length > 0) {
        await admin
          .from('notifications')
          .insert(notifications)
      }
    }

    await admin.from('audit_logs').insert({
      actor_student_id: student.id,
      action: 'CLUB_ANNOUNCEMENT_CREATED',
      entity_type: 'ANNOUNCEMENT',
      entity_id: announcement.id,
      metadata: {
        club_id: club.id,
        title,
        visibility,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement published successfully.',
      announcement,
    })
  } catch (error) {
    console.error('Announcements POST error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    const announcementId = String(
      body.id ?? ''
    ).trim()

    const title = String(
      body.title ?? ''
    ).trim()

    const content = String(
      body.content ?? ''
    ).trim()

    const visibility = String(
      body.visibility ?? ''
    ).toUpperCase()

    if (!announcementId) {
      return NextResponse.json(
        { error: 'Announcement ID is required.' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Announcement title is required.' },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Announcement content is required.' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Announcement title is too long.' },
        { status: 400 }
      )
    }

    if (!isVisibility(visibility)) {
      return NextResponse.json(
        { error: 'Invalid announcement visibility.' },
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

    const admin = createAdminClient()

    const { data: club, error: clubError } = await admin
      .from('clubs')
      .select('id, name, slug, status')
      .eq('slug', slug)
      .single()

    if (clubError || !club || club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { data: membership } = await admin
      .from('club_members')
      .select('role')
      .eq('club_id', club.id)
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const { data: adminRole } = await admin
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const canManage =
      adminRole !== null ||
      membership?.role === 'HEAD' ||
      membership?.role === 'COORDINATOR'

    if (!canManage) {
      return NextResponse.json(
        {
          error:
            'You do not have permission to edit announcements.',
        },
        { status: 403 }
      )
    }

    const { data: existing, error: existingError } =
      await admin
        .from('announcements')
        .select(
          'id, club_id, title, content, visibility'
        )
        .eq('id', announcementId)
        .eq('club_id', club.id)
        .maybeSingle()

    if (existingError) {
      console.error(
        'Find announcement error:',
        existingError
      )

      return NextResponse.json(
        { error: 'Failed to find announcement.' },
        { status: 500 }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found.' },
        { status: 404 }
      )
    }

    const { data: announcement, error: updateError } =
      await admin
        .from('announcements')
        .update({
          title,
          content,
          visibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', announcementId)
        .eq('club_id', club.id)
        .select(`
          id,
          title,
          content,
          visibility,
          created_at,
          updated_at,
          created_by
        `)
        .single()

    if (updateError) {
      console.error(
        'Update announcement error:',
        updateError
      )

      return NextResponse.json(
        { error: 'Failed to update announcement.' },
        { status: 500 }
      )
    }

    await admin.from('audit_logs').insert({
      actor_student_id: student.id,
      action: 'CLUB_ANNOUNCEMENT_UPDATED',
      entity_type: 'ANNOUNCEMENT',
      entity_id: announcement.id,
      metadata: {
        club_id: club.id,
        previous_title: existing.title,
        previous_visibility: existing.visibility,
        title,
        visibility,
      },
    })

    /*
     * Notify members when an announcement becomes
     * visible to them.
     *
     * We do not send notifications for PRIVATE content.
     */
    if (visibility !== 'PRIVATE') {
      const becameVisibleToMembers =
        existing.visibility === 'PRIVATE' ||
        existing.visibility !== visibility

      if (becameVisibleToMembers) {
        const { data: activeMembers } = await admin
          .from('club_members')
          .select('student_id')
          .eq('club_id', club.id)
          .eq('status', 'ACTIVE')

        const notifications = (activeMembers ?? [])
          .filter(
            (member) =>
              member.student_id !== student.id
          )
          .map((member) => ({
              student_id: member.student_id,
              club_id: club.id,
              type: 'CLUB_ANNOUNCEMENT',
              title: `Announcement updated in ${club.name}`,
              message: title,
            }))

        if (notifications.length > 0) {
          await admin
            .from('notifications')
            .insert(notifications)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement,
    })
  } catch (error) {
    console.error('Announcements PATCH error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const url = new URL(request.url)
    const announcementId = url.searchParams
      .get('id')
      ?.trim()

    if (!announcementId) {
      return NextResponse.json(
        { error: 'Announcement ID is required.' },
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

    const admin = createAdminClient()

    const { data: club, error: clubError } = await admin
      .from('clubs')
      .select('id, name, slug, status')
      .eq('slug', slug)
      .single()

    if (clubError || !club || club.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { data: membership } = await admin
      .from('club_members')
      .select('role')
      .eq('club_id', club.id)
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const { data: adminRole } = await admin
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const canManage =
      adminRole !== null ||
      membership?.role === 'HEAD' ||
      membership?.role === 'COORDINATOR'

    if (!canManage) {
      return NextResponse.json(
        {
          error:
            'You do not have permission to delete announcements.',
        },
        { status: 403 }
      )
    }

    const { data: existing, error: existingError } =
      await admin
        .from('announcements')
        .select(
          'id, club_id, title, visibility'
        )
        .eq('id', announcementId)
        .eq('club_id', club.id)
        .maybeSingle()

    if (existingError) {
      console.error(
        'Find announcement error:',
        existingError
      )

      return NextResponse.json(
        { error: 'Failed to find announcement.' },
        { status: 500 }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found.' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await admin
      .from('announcements')
      .delete()
      .eq('id', announcementId)
      .eq('club_id', club.id)

    if (deleteError) {
      console.error(
        'Delete announcement error:',
        deleteError
      )

      return NextResponse.json(
        { error: 'Failed to delete announcement.' },
        { status: 500 }
      )
    }

    await admin.from('audit_logs').insert({
      actor_student_id: student.id,
      action: 'CLUB_ANNOUNCEMENT_DELETED',
      entity_type: 'ANNOUNCEMENT',
      entity_id: existing.id,
      metadata: {
        club_id: club.id,
        title: existing.title,
        visibility: existing.visibility,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully.',
    })
  } catch (error) {
    console.error('Announcements DELETE error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}