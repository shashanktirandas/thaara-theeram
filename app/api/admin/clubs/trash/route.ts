import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TRASH_RETENTION_DAYS = 7

export async function GET() {
  try {
    const supabase = await createClient()

    // ---------------------------------------------
    // Check logged-in user
    // ---------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    // ---------------------------------------------
    // Find student account
    // ---------------------------------------------

    const { data: student, error: studentError } =
      await supabase
        .from('students')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student account not found.' },
        { status: 403 }
      )
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
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      )
    }

    // ---------------------------------------------
    // Admin database client
    // ---------------------------------------------

    const admin = createAdminClient()

    // ---------------------------------------------
    // Get trashed clubs
    // ---------------------------------------------

    const { data: clubs, error: clubsError } =
      await admin
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

    if (clubsError) {
      console.error(
        'Trash clubs lookup failed:',
        clubsError
      )

      return NextResponse.json(
        { error: 'Unable to load Trash.' },
        { status: 500 }
      )
    }

    // ---------------------------------------------
    // Add recovery information
    // ---------------------------------------------

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

        const recoveryExpired =
          !restoreUntil ||
          now >= restoreUntil

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
            recoveryExpired,
        }
      }
    )

    return NextResponse.json({
      clubs: formattedClubs,
    })
  } catch (error) {
    console.error(
      'Admin Trash GET error:',
      error
    )

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}