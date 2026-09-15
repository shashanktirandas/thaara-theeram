import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      )
    }
    const { data: student, error: studentError } = await supabase
  .from('students')
  .select('id')
  .eq('auth_user_id', user.id)
  .single()

if (studentError || !student) {
  return NextResponse.json(
    { error: 'Student profile not found.' },
    { status: 404 }
  )
}
    

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        read,
        created_at,
        club_id,
        club:clubs (
          name,
          slug
        )
      `)
        .eq('student_id', student.id)
  .order('created_at', { ascending: false })
  .limit(50)

    if (error) {
      console.error('Notifications fetch error:', error)

      return NextResponse.json(
        { error: 'Unable to load notifications.' },
        { status: 500 }
      )
    }

    const unreadCount =
      notifications?.filter((notification) => !notification.read)
        .length ?? 0

    return NextResponse.json({
      notifications: notifications ?? [],
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications GET error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      )
    }
    const { data: student, error: studentError } = await supabase
  .from('students')
  .select('id')
  .eq('auth_user_id', user.id)
  .single()

if (studentError || !student) {
  return NextResponse.json(
    { error: 'Student profile not found.' },
    { status: 404 }
  )
}

    const body = await request.json()

    const action = body.action

    if (
      action !== 'MARK_READ' &&
      action !== 'MARK_ALL_READ'
    ) {
      return NextResponse.json(
        { error: 'Invalid action.' },
        { status: 400 }
      )
    }

    if (action === 'MARK_ALL_READ') {
      const { data: updatedNotifications, error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('student_id', student.id)
  .eq('read', false)
  .select('id')

      if (error) {
        console.error(
          'Mark all notifications read error:',
          error
        )

        return NextResponse.json(
          { error: 'Unable to mark notifications as read.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
  success: true,
  updatedCount: updatedNotifications?.length ?? 0,
})
    }

    const notificationId = body.notificationId

    if (
      typeof notificationId !== 'string' ||
      !notificationId
    ) {
      return NextResponse.json(
        { error: 'Notification ID is required.' },
        { status: 400 }
      )
    }

    const { data: updatedNotification, error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId)
  .eq('student_id', student.id)
  .select('id, read')
  .maybeSingle()

if (error) {
  console.error(
    'Mark notification read error:',
    error
  )

  return NextResponse.json(
    { error: 'Unable to mark notification as read.' },
    { status: 500 }
  )
}

if (!updatedNotification) {
  return NextResponse.json(
    { error: 'Notification not found or not owned by you.' },
    { status: 404 }
  )
}

return NextResponse.json({
  success: true,
  notification: updatedNotification,
})
  } catch (error) {
    console.error('Notifications PATCH error:', error)

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}