import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getAuthorizedAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      student: null,
      error: 'Please log in first.',
      status: 401,
    }
  }

  const { data: student, error: studentError } =
    await supabase
      .from('students')
      .select('id, name, roll_number')
      .eq('auth_user_id', user.id)
      .single()

  if (studentError || !student) {
    return {
      student: null,
      error: 'Student account not found.',
      status: 403,
    }
  }

  const { data: adminRole, error: adminError } =
    await supabase
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

  if (adminError || !adminRole) {
    return {
      student: null,
      error:
        'Only active Platform Admins can manage administrators.',
      status: 403,
    }
  }

  return {
    student,
    error: null,
    status: 200,
  }
}

// ============================================================
// GET — Load all administrator records
// ============================================================

export async function GET() {
  try {
    const auth = await getAuthorizedAdmin()

    if (auth.error || !auth.student) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized.' },
        { status: auth.status }
      )
    }

    const admin = createAdminClient()

    const { data: roles, error: rolesError } =
      await admin
        .from('admin_roles')
        .select(`
          id,
          student_id,
          status,
          granted_at,
          accepted_at,
          revoked_at,
          created_at
        `)
        .order('created_at', {
          ascending: false,
        })

    if (rolesError) {
      console.error(
        'Administrator roles load error:',
        rolesError
      )

      return NextResponse.json(
        {
          error:
            'Could not load administrator records.',
        },
        { status: 500 }
      )
    }

    const studentIds = [
      ...new Set(
        (roles || []).map(
          (role) => role.student_id
        )
      ),
    ]

    let students: {
      id: string
      name: string
      roll_number: string
      college_email: string
      department: string
      year: string
      section: string
    }[] = []

    if (studentIds.length > 0) {
      const { data: studentRows, error: studentError } =
        await admin
          .from('students')
          .select(`
            id,
            name,
            roll_number,
            college_email,
            department,
            year,
            section
          `)
          .in('id', studentIds)

      if (studentError) {
        console.error(
          'Administrator student load error:',
          studentError
        )

        return NextResponse.json(
          {
            error:
              'Could not load administrator student details.',
          },
          { status: 500 }
        )
      }

      students = studentRows || []
    }

    const studentMap = new Map(
      students.map((student) => [
        student.id,
        student,
      ])
    )

    const administrators = (roles || []).map(
      (role) => ({
        ...role,
        student:
          studentMap.get(role.student_id) ||
          null,
      })
    )

    return NextResponse.json({
      success: true,
      admins: administrators,
    })
  } catch (error) {
    console.error(
      'Administrator GET error:',
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

// ============================================================
// POST — Invite / Revoke
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    const auth = await getAuthorizedAdmin()

    if (auth.error || !auth.student) {
      return NextResponse.json(
        {
          error:
            auth.error || 'Unauthorized.',
        },
        { status: auth.status }
      )
    }

    const body = await request.json()

    const action = body?.action

    const admin = createAdminClient()

    // ========================================================
    // INVITE ADMIN
    // ========================================================

    if (action === 'invite') {
      const rollNumber = String(
        body?.roll_number || ''
      )
        .trim()
        .toLowerCase()

      if (!rollNumber) {
        return NextResponse.json(
          {
            error:
              'Roll number is required.',
          },
          { status: 400 }
        )
      }

      // Find student
      const { data: targetStudent, error: targetError } =
        await admin
          .from('students')
          .select(`
            id,
            name,
            roll_number,
            college_email,
            auth_user_id
          `)
          .eq('roll_number', rollNumber)
          .maybeSingle()

      if (targetError) {
        console.error(
          'Target student lookup error:',
          targetError
        )

        return NextResponse.json(
          {
            error:
              'Could not find the student.',
          },
          { status: 500 }
        )
      }

      if (!targetStudent) {
        return NextResponse.json(
          {
            error:
              'No student was found with that roll number.',
          },
          { status: 404 }
        )
      }

      // Student must already have an account
      if (!targetStudent.auth_user_id) {
        return NextResponse.json(
          {
            error:
              'This student has not activated their Thaara Theeram account yet.',
          },
          { status: 400 }
        )
      }

      // Already active?
      const { data: activeRole } =
        await admin
          .from('admin_roles')
          .select('id')
          .eq(
            'student_id',
            targetStudent.id
          )
          .eq('status', 'ACTIVE')
          .maybeSingle()

      if (activeRole) {
        return NextResponse.json(
          {
            error:
              'This student is already an active Platform Admin.',
          },
          { status: 409 }
        )
      }

      // Already pending?
      const { data: pendingRole } =
        await admin
          .from('admin_roles')
          .select('id')
          .eq(
            'student_id',
            targetStudent.id
          )
          .eq('status', 'PENDING')
          .maybeSingle()

      if (pendingRole) {
        return NextResponse.json(
          {
            error:
              'This student already has a pending administrator invitation.',
          },
          { status: 409 }
        )
      }

      // Create pending invitation
      const { data: newRole, error: insertError } =
        await admin
          .from('admin_roles')
          .insert({
            student_id:
              targetStudent.id,
            status: 'PENDING',
            granted_by:
              auth.student.id,
          })
          .select('id')
          .single()

      if (insertError || !newRole) {
        console.error(
          'Admin invitation insert error:',
          insertError
        )

        return NextResponse.json(
          {
            error:
              'Could not create administrator invitation.',
          },
          { status: 500 }
        )
      }

      // Notification
      const { error: notificationError } =
        await admin
          .from('notifications')
          .insert({
            student_id:
              targetStudent.id,
            type:
              'ADMIN_INVITATION',
            title:
              'Administrator Invitation',
            message:
              `${auth.student.name} invited you to become a Platform Admin of Thaara Theeram.`,
          })

      if (notificationError) {
        console.error(
          'Admin invitation notification error:',
          notificationError
        )
      }

      // Audit
      const { error: auditError } =
        await admin
          .from('audit_logs')
          .insert({
            actor_student_id:
              auth.student.id,
            action:
              'ADMIN_INVITATION_CREATED',
            entity_type:
              'ADMIN_ROLE',
            entity_id:
              newRole.id,
            metadata: {
              target_student_id:
                targetStudent.id,
              target_roll_number:
                targetStudent.roll_number,
            },
          })

      if (auditError) {
        console.error(
          'Admin invitation audit error:',
          auditError
        )
      }

      return NextResponse.json({
        success: true,
        message:
          `Administrator invitation sent to ${targetStudent.name}.`,
        adminRoleId:
          newRole.id,
      })
    }

    // ========================================================
    // REVOKE ADMIN
    // ========================================================

    if (action === 'revoke') {
      const adminRoleId = String(
        body?.admin_role_id || ''
      ).trim()

      if (!adminRoleId) {
        return NextResponse.json(
          {
            error:
              'Administrator role ID is required.',
          },
          { status: 400 }
        )
      }

      // Find target role
      const { data: targetRole, error: roleError } =
        await admin
          .from('admin_roles')
          .select(`
            id,
            student_id,
            status
          `)
          .eq('id', adminRoleId)
          .maybeSingle()

      if (roleError) {
        console.error(
          'Admin role lookup error:',
          roleError
        )

        return NextResponse.json(
          {
            error:
              'Could not find administrator role.',
          },
          { status: 500 }
        )
      }

      if (!targetRole) {
        return NextResponse.json(
          {
            error:
              'Administrator role not found.',
          },
          { status: 404 }
        )
      }

      if (targetRole.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            error:
              'This administrator role is not active.',
          },
          { status: 400 }
        )
      }

      // Count active admins
      const { count, error: countError } =
        await admin
          .from('admin_roles')
          .select('id', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'ACTIVE')

      if (countError) {
        console.error(
          'Active admin count error:',
          countError
        )

        return NextResponse.json(
          {
            error:
              'Could not verify active administrator count.',
          },
          { status: 500 }
        )
      }

      // Last Admin protection
      if ((count || 0) <= 1) {
        return NextResponse.json(
          {
            error:
              'The last active Platform Admin cannot be removed.',
          },
          { status: 400 }
        )
      }

      // Revoke
      const { error: revokeError } =
        await admin
          .from('admin_roles')
          .update({
            status: 'REVOKED',
            revoked_by:
              auth.student.id,
            revoked_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', targetRole.id)
          .eq('status', 'ACTIVE')

      if (revokeError) {
        console.error(
          'Admin revoke error:',
          revokeError
        )

        return NextResponse.json(
          {
            error:
              'Could not revoke administrator access.',
          },
          { status: 500 }
        )
      }

      // Notification
      const { error: notificationError } =
        await admin
          .from('notifications')
          .insert({
            student_id:
              targetRole.student_id,
            type:
              'ADMIN_ACCESS_REVOKED',
            title:
              'Administrator Access Revoked',
            message:
              'Your Platform Admin access to Thaara Theeram has been revoked.',
          })

      if (notificationError) {
        console.error(
          'Admin revoke notification error:',
          notificationError
        )
      }

      // Audit
      const { error: auditError } =
        await admin
          .from('audit_logs')
          .insert({
            actor_student_id:
              auth.student.id,
            action:
              'ADMIN_ACCESS_REVOKED',
            entity_type:
              'ADMIN_ROLE',
            entity_id:
              targetRole.id,
            metadata: {
              target_student_id:
                targetRole.student_id,
            },
          })

      if (auditError) {
        console.error(
          'Admin revoke audit error:',
          auditError
        )
      }

      return NextResponse.json({
        success: true,
        message:
          'Administrator access revoked.',
      })
    }

    return NextResponse.json(
      {
        error:
          'Invalid administrator action.',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error(
      'Administrator API error:',
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