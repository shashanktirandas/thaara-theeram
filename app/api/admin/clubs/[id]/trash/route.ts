import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TRASH_RETENTION_DAYS = 7

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

async function getAdminStudent() {
  const supabase = await createClient()

  // ---------------------------------------------
  // Check logged-in user
  // ---------------------------------------------

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      ),
    }
  }

  // ---------------------------------------------
  // Find student account
  // ---------------------------------------------

  const { data: student, error: studentError } =
    await supabase
      .from('students')
      .select('id, name, roll_number')
      .eq('auth_user_id', user.id)
      .single()

  if (studentError || !student) {
    return {
      response: NextResponse.json(
        { error: 'Student account not found.' },
        { status: 403 }
      ),
    }
  }

  // ---------------------------------------------
  // Verify active Platform Admin
  // ---------------------------------------------

  const { data: adminRole, error: adminError } =
    await supabase
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

  if (adminError || !adminRole) {
    return {
      response: NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      ),
    }
  }

  return {
    student,
  }
}

/*
|--------------------------------------------------------------------------
| GET
| Load clubs currently in Trash.
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const adminCheck = await getAdminStudent()

    if ('response' in adminCheck) {
      return adminCheck.response
    }

    // ---------------------------------------------
    // Use service-role client for admin data access
    // ---------------------------------------------

    const admin = createAdminClient()

    const { data: clubs, error } = await admin
      .from('clubs')
      .select(
        `
        id,
        name,
        slug,
        category,
        status,
        status_before_trash,
        deleted_at,
        deleted_by
        `
      )
      .eq('status', 'TRASHED')
      .order('deleted_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Trash clubs lookup failed:',
        error
      )

      return NextResponse.json(
        { error: 'Unable to load Trash.' },
        { status: 500 }
      )
    }

    const now = Date.now()

    const formattedClubs = (clubs ?? []).map(
      (club) => {
        const deletedAt = club.deleted_at
          ? new Date(
              club.deleted_at
            ).getTime()
          : null

        const restoreUntil = deletedAt
          ? deletedAt +
            TRASH_RETENTION_DAYS *
              24 *
              60 *
              60 *
              1000
          : null

        const remainingMs = restoreUntil
          ? Math.max(
              0,
              restoreUntil - now
            )
          : 0

        const remainingDays = Math.ceil(
          remainingMs /
            (24 * 60 * 60 * 1000)
        )

        return {
          ...club,

          restore_available_until:
            restoreUntil
              ? new Date(
                  restoreUntil
                ).toISOString()
              : null,

          remaining_days:
            remainingDays,

          recovery_expired:
            !restoreUntil ||
            now >= restoreUntil,
        }
      }
    )

    return NextResponse.json({
      clubs: formattedClubs,
    })
  } catch (error) {
    console.error(
      'Trash GET error:',
      error
    )

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

/*
|--------------------------------------------------------------------------
| POST
| Trash or restore a club.
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const adminCheck = await getAdminStudent()

    if ('response' in adminCheck) {
      return adminCheck.response
    }

    const { student } = adminCheck

    const { id } = await params

    // ---------------------------------------------
    // Read request
    // ---------------------------------------------

    const body = await request.json()

    const action =
      typeof body.action === 'string'
        ? body.action
            .trim()
            .toUpperCase()
        : ''

    const clubNameConfirmation =
      typeof body.clubNameConfirmation ===
      'string'
        ? body.clubNameConfirmation.trim()
        : ''

    if (
      action !== 'TRASH' &&
      action !== 'RESTORE'
    ) {
      return NextResponse.json(
        { error: 'Invalid action.' },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // Admin database client
    // ---------------------------------------------

    const admin = createAdminClient()

    // ---------------------------------------------
    // Find club
    // ---------------------------------------------

    const { data: club, error: clubError } =
      await admin
        .from('clubs')
        .select(
          `
          id,
          name,
          slug,
          status,
          status_before_trash,
          deleted_at,
          deleted_by
          `
        )
        .eq('id', id)
        .single()

    if (clubError || !club) {
      console.error(
        'Club lookup failed:',
        clubError
      )

      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    /*
    |--------------------------------------------------------------------------
    | TRASH
    |--------------------------------------------------------------------------
    */

    if (action === 'TRASH') {
      // Already trashed
      if (club.status === 'TRASHED') {
        return NextResponse.json(
          {
            error:
              'This club is already in Trash.',
          },
          { status: 409 }
        )
      }

      // Only ACTIVE or ARCHIVED can be trashed
      if (
        club.status !== 'ACTIVE' &&
        club.status !== 'ARCHIVED'
      ) {
        return NextResponse.json(
          {
            error:
              'This club cannot be moved to Trash from its current state.',
          },
          { status: 409 }
        )
      }

      // -------------------------------------------
      // Exact name confirmation
      // -------------------------------------------

      if (
        clubNameConfirmation !== club.name
      ) {
        return NextResponse.json(
          {
            error:
              'The club name does not match exactly.',
          },
          { status: 400 }
        )
      }

      const previousStatus =
        club.status

      const deletedAt =
        new Date().toISOString()

      // -------------------------------------------
      // Move to Trash
      // -------------------------------------------

      const {
        data: updatedClub,
        error: updateError,
      } = await admin
        .from('clubs')
        .update({
          status: 'TRASHED',
          status_before_trash:
            previousStatus,
          deleted_at: deletedAt,
          deleted_by: student.id,
          updated_at: deletedAt,
        })
        .eq('id', club.id)
        .eq('status', previousStatus)
        .select(
          `
          id,
          name,
          slug,
          status,
          status_before_trash,
          deleted_at,
          deleted_by
          `
        )
        .single()

      if (updateError) {
        console.error(
          'Club trash update failed:',
          updateError
        )

        return NextResponse.json(
          {
            error:
              updateError.message ||
              'Unable to move the club to Trash.',
          },
          { status: 500 }
        )
      }

      // -------------------------------------------
      // Audit
      // -------------------------------------------

      const { error: auditError } =
        await admin
          .from('audit_logs')
          .insert({
            actor_student_id:
              student.id,
            action:
              'CLUB_TRASHED',
            entity_type: 'CLUB',
            entity_id: club.id,
            metadata: {
              club_name:
                club.name,
              club_slug:
                club.slug,
              previous_status:
                previousStatus,
              deleted_at:
                deletedAt,
              retention_days:
                TRASH_RETENTION_DAYS,
            },
          })

      if (auditError) {
        console.error(
          'Trash audit log failed:',
          auditError
        )
      }

      const restoreAvailableUntil =
        new Date(
          new Date(
            deletedAt
          ).getTime() +
            TRASH_RETENTION_DAYS *
              24 *
              60 *
              60 *
              1000
        ).toISOString()

      return NextResponse.json({
        success: true,
        action: 'TRASHED',
        club: updatedClub,
        restore_available_until:
          restoreAvailableUntil,
      })
    }

    /*
    |--------------------------------------------------------------------------
    | RESTORE
    |--------------------------------------------------------------------------
    */

    if (club.status !== 'TRASHED') {
      return NextResponse.json(
        {
          error:
            'Only clubs currently in Trash can be restored.',
        },
        { status: 409 }
      )
    }

    if (!club.deleted_at) {
      return NextResponse.json(
        {
          error:
            'This trashed club does not have a valid deletion timestamp.',
        },
        { status: 409 }
      )
    }

    const deletedAt = new Date(
      club.deleted_at
    )

    if (
      Number.isNaN(
        deletedAt.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            'This club has an invalid Trash timestamp.',
        },
        { status: 500 }
      )
    }

    const restoreDeadline =
      new Date(
        deletedAt.getTime() +
          TRASH_RETENTION_DAYS *
            24 *
            60 *
            60 *
            1000
      )

    // ---------------------------------------------
    // 7-day recovery protection
    // ---------------------------------------------

    if (
      new Date() >=
      restoreDeadline
    ) {
      return NextResponse.json(
        {
          error:
            'The 7-day recovery period for this club has expired.',
          restore_available_until:
            restoreDeadline.toISOString(),
        },
        { status: 410 }
      )
    }

    // ---------------------------------------------
    // Restore previous state
    // ---------------------------------------------

    const restoredStatus =
      club.status_before_trash ===
      'ARCHIVED'
        ? 'ARCHIVED'
        : 'ACTIVE'

    const {
      data: restoredClub,
      error: restoreError,
    } = await admin
      .from('clubs')
      .update({
        status: restoredStatus,
        status_before_trash:
          null,
        deleted_at: null,
        deleted_by: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', club.id)
      .eq('status', 'TRASHED')
      .select(
        `
        id,
        name,
        slug,
        status,
        status_before_trash,
        deleted_at,
        deleted_by
        `
      )
      .single()

    if (restoreError) {
      console.error(
        'Club restore failed:',
        restoreError
      )

      return NextResponse.json(
        {
          error:
            restoreError.message ||
            'Unable to restore the club.',
        },
        { status: 500 }
      )
    }

    // ---------------------------------------------
    // Audit
    // ---------------------------------------------

    const { error: auditError } =
      await admin
        .from('audit_logs')
        .insert({
          actor_student_id:
            student.id,
          action:
            'CLUB_RESTORED',
          entity_type: 'CLUB',
          entity_id: club.id,
          metadata: {
            club_name:
              club.name,
            club_slug:
              club.slug,
            restored_status:
              restoredStatus,
            deleted_at:
              club.deleted_at,
          },
        })

    if (auditError) {
      console.error(
        'Restore audit log failed:',
        auditError
      )
    }

    return NextResponse.json({
      success: true,
      action: 'RESTORED',
      club: restoredClub,
      restored_status:
        restoredStatus,
    })
  } catch (error) {
    console.error(
      'Club trash/restore API error:',
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