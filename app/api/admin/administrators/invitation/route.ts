import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest
) {
  try {
    const supabase = await createClient()

    // ---------------------------------------------------------
    // 1. Authenticate
    // ---------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Please log in first.',
        },
        { status: 401 }
      )
    }

    // ---------------------------------------------------------
    // 2. Find current student
    // ---------------------------------------------------------

    const { data: student, error: studentError } =
      await supabase
        .from('students')
        .select('id, name, roll_number')
        .eq('auth_user_id', user.id)
        .single()

    if (studentError || !student) {
      return NextResponse.json(
        {
          error:
            'Student profile not found.',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    const action = body?.action

    if (
      action !== 'accept' &&
      action !== 'reject'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid invitation action.',
        },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // ---------------------------------------------------------
    // 3. Find this student's pending Admin invitation
    // ---------------------------------------------------------

    const { data: invitation, error: invitationError } =
      await admin
        .from('admin_roles')
        .select(`
          id,
          student_id,
          status,
          granted_by,
          created_at
        `)
        .eq(
          'student_id',
          student.id
        )
        .eq(
          'status',
          'PENDING'
        )
        .maybeSingle()

    if (invitationError) {
      console.error(
        'Admin invitation lookup error:',
        invitationError
      )

      return NextResponse.json(
        {
          error:
            'Could not load administrator invitation.',
        },
        { status: 500 }
      )
    }

    if (!invitation) {
      return NextResponse.json(
        {
          error:
            'No pending administrator invitation was found.',
        },
        { status: 404 }
      )
    }

    // =========================================================
    // ACCEPT
    // =========================================================

    if (action === 'accept') {
      const now =
        new Date().toISOString()

      const { error: updateError } =
        await admin
          .from('admin_roles')
          .update({
            status: 'ACTIVE',
            granted_at: now,
            accepted_at: now,
            updated_at: now,
          })
          .eq(
            'id',
            invitation.id
          )
          .eq(
            'student_id',
            student.id
          )
          .eq(
            'status',
            'PENDING'
          )

      if (updateError) {
        console.error(
          'Admin invitation acceptance error:',
          updateError
        )

        return NextResponse.json(
          {
            error:
              'Could not activate administrator access.',
          },
          { status: 500 }
        )
      }

      // -------------------------------------------------------
      // Mark invitation notification as read
      // -------------------------------------------------------

      const { error: notificationError } =
        await admin
          .from('notifications')
          .update({
            read: true,
          })
          .eq(
            'student_id',
            student.id
          )
          .eq(
            'type',
            'ADMIN_INVITATION'
          )
          .eq(
            'read',
            false
          )

      if (notificationError) {
        console.error(
          'Admin invitation notification update error:',
          notificationError
        )
      }

      // -------------------------------------------------------
      // Notify inviting Admin
      // -------------------------------------------------------

      if (invitation.granted_by) {
        await admin
          .from('notifications')
          .insert({
            student_id:
              invitation.granted_by,
            type:
              'ADMIN_INVITATION_ACCEPTED',
            title:
              'Administrator Invitation Accepted',
            message:
              `${student.name} accepted the Platform Admin invitation.`,
          })
      }

      // -------------------------------------------------------
      // Audit
      // -------------------------------------------------------

      await admin
        .from('audit_logs')
        .insert({
          actor_student_id:
            student.id,
          action:
            'ADMIN_INVITATION_ACCEPTED',
          entity_type:
            'ADMIN_ROLE',
          entity_id:
            invitation.id,
          metadata: {
            student_id:
              student.id,
            roll_number:
              student.roll_number,
          },
        })

      return NextResponse.json({
        success: true,
        status: 'ACTIVE',
        message:
          'You are now a Platform Admin of Thaara Theeram.',
      })
    }

    // =========================================================
    // REJECT
    // =========================================================

    if (action === 'reject') {
      const now =
        new Date().toISOString()

      const { error: updateError } =
        await admin
          .from('admin_roles')
          .update({
            status: 'REVOKED',
            revoked_at: now,
            updated_at: now,
          })
          .eq(
            'id',
            invitation.id
          )
          .eq(
            'student_id',
            student.id
          )
          .eq(
            'status',
            'PENDING'
          )

      if (updateError) {
        console.error(
          'Admin invitation rejection error:',
          updateError
        )

        return NextResponse.json(
          {
            error:
              'Could not reject administrator invitation.',
          },
          { status: 500 }
        )
      }

      // -------------------------------------------------------
      // Mark notification as read
      // -------------------------------------------------------

      const { error: notificationError } =
        await admin
          .from('notifications')
          .update({
            read: true,
          })
          .eq(
            'student_id',
            student.id
          )
          .eq(
            'type',
            'ADMIN_INVITATION'
          )
          .eq(
            'read',
            false
          )

      if (notificationError) {
        console.error(
          'Admin invitation notification update error:',
          notificationError
        )
      }

      // -------------------------------------------------------
      // Notify inviting Admin
      // -------------------------------------------------------

      if (invitation.granted_by) {
        await admin
          .from('notifications')
          .insert({
            student_id:
              invitation.granted_by,
            type:
              'ADMIN_INVITATION_REJECTED',
            title:
              'Administrator Invitation Declined',
            message:
              `${student.name} declined the Platform Admin invitation.`,
          })
      }

      // -------------------------------------------------------
      // Audit
      // -------------------------------------------------------

      await admin
        .from('audit_logs')
        .insert({
          actor_student_id:
            student.id,
          action:
            'ADMIN_INVITATION_REJECTED',
          entity_type:
            'ADMIN_ROLE',
          entity_id:
            invitation.id,
          metadata: {
            student_id:
              student.id,
            roll_number:
              student.roll_number,
          },
        })

      return NextResponse.json({
        success: true,
        status: 'REVOKED',
        message:
          'Administrator invitation declined.',
      })
    }

    return NextResponse.json(
      {
        error:
          'Invalid invitation action.',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error(
      'Admin invitation API error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Something went wrong.',
      },
      { status: 500 }
    )
  }
}