import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Authenticate
    // --------------------------------------------------

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    // --------------------------------------------------
    // 2. Find current student
    // --------------------------------------------------

    const { data: student, error: studentError } =
      await supabase
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

    // --------------------------------------------------
    // 3. Verify Platform Admin
    // --------------------------------------------------

    const admin = createAdminClient()

    const { data: adminRole, error: adminError } =
      await admin
        .from('admin_roles')
        .select('id')
        .eq('student_id', student.id)
        .eq('status', 'ACTIVE')
        .maybeSingle()

    if (adminError) {
      console.error(
        'Admin role lookup error:',
        adminError
      )

      return NextResponse.json(
        { error: 'Unable to verify administrator access.' },
        { status: 500 }
      )
    }

    if (!adminRole) {
      return NextResponse.json(
        { error: 'Administrator access required.' },
        { status: 403 }
      )
    }

    // --------------------------------------------------
    // 4. Read query parameters
    // --------------------------------------------------

    const { searchParams } = new URL(request.url)

    const page = Math.max(
      Number(searchParams.get('page') || '1'),
      1
    )

    const limit = Math.min(
      Math.max(
        Number(searchParams.get('limit') || '25'),
        1
      ),
      100
    )

    const search =
      searchParams.get('search')?.trim() || ''

    const action =
      searchParams.get('action')?.trim() || ''

    const entityType =
      searchParams.get('entity_type')?.trim() || ''

    const from =
      searchParams.get('from')?.trim() || ''

    const to =
      searchParams.get('to')?.trim() || ''

    const fromIndex = (page - 1) * limit
    const toIndex = fromIndex + limit - 1

    // --------------------------------------------------
    // 5. Query audit logs
    // --------------------------------------------------

    let query = admin
      .from('audit_logs')
      .select(
        `
        id,
        actor_student_id,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at,
        actor:students!audit_logs_actor_student_id_fkey (
          id,
          name,
          roll_number,
          department,
          year,
          section
        )
        `,
        { count: 'exact' }
      )
      .order('created_at', {
        ascending: false,
      })
      .range(fromIndex, toIndex)

    if (action) {
      query = query.eq('action', action)
    }

    if (entityType) {
      query = query.eq(
        'entity_type',
        entityType
      )
    }

    if (from) {
      query = query.gte(
        'created_at',
        `${from}T00:00:00.000Z`
      )
    }

    if (to) {
      query = query.lt(
        'created_at',
        `${to}T23:59:59.999Z`
      )
    }

    const {
      data: logs,
      error: logsError,
      count,
    } = await query

    if (logsError) {
      console.error(
        'Audit logs query error:',
        logsError
      )

      return NextResponse.json(
        { error: 'Unable to load activity.' },
        { status: 500 }
      )
    }

    // --------------------------------------------------
    // 6. Search human-readable content
    // --------------------------------------------------

    let filteredLogs = logs ?? []

    if (search) {
      const q = search.toLowerCase()

      filteredLogs = filteredLogs.filter((log: any) => {
        const actor = Array.isArray(log.actor)
          ? log.actor[0]
          : log.actor

        const searchable = [
          log.action,
          log.entity_type,
          actor?.name,
          actor?.roll_number,
          JSON.stringify(log.metadata ?? {}),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(q)
      })
    }

    return NextResponse.json({
      success: true,
      activities: filteredLogs,
      pagination: {
        page,
        limit,
        total: count ?? filteredLogs.length,
        totalPages: Math.ceil(
          (count ?? filteredLogs.length) / limit
        ),
      },
    })
  } catch (error) {
    console.error(
      'Admin activity API error:',
      error
    )

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}