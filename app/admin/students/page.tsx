import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'

export default async function AdminStudentsPage() {
  const { supabase } = await requireAdmin()

  const { data: students, error } = await supabase
    .from('students')
    .select(`
      id,
      roll_number,
      name,
      college_email,
      department,
      year,
      section,
      auth_user_id
    `)
    .order('roll_number', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const studentIds = (students ?? []).map((student) => student.id)

  const { data: memberships } =
    studentIds.length > 0
      ? await supabase
          .from('club_members')
          .select(`
            student_id,
            role,
            status,
            clubs (
              name,
              slug
            )
          `)
          .in('student_id', studentIds)
          .eq('status', 'ACTIVE')
      : { data: [] }

  const membershipsByStudent = new Map<
    string,
    {
      role: string
      clubName: string
      clubSlug: string
    }[]
  >()

  for (const membership of memberships ?? []) {
    const club = Array.isArray(membership.clubs)
      ? membership.clubs[0]
      : membership.clubs

    if (!club) continue

    const existing =
      membershipsByStudent.get(membership.student_id) ?? []

    existing.push({
      role: membership.role,
      clubName: club.name,
      clubSlug: club.slug,
    })

    membershipsByStudent.set(membership.student_id, existing)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <Link
          href="/admin"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Thaara Theeram
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-slate-600">
            View every student in the college roster and their Thaara
            Theeram involvement.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Total students in roster
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {students?.length ?? 0}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Academic
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Club Involvement
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {(students ?? []).map((student) => {
                  const studentMemberships =
                    membershipsByStudent.get(student.id) ?? []

                  return (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          {student.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {student.roll_number}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {student.department}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {student.year} • Section {student.section}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {student.auth_user_id ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Not activated
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {studentMemberships.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No active clubs
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {studentMemberships.map((membership) => (
                              <div
                                key={`${membership.clubSlug}-${membership.role}`}
                                className="text-sm"
                              >
                                <span className="font-medium text-slate-800">
                                  {membership.clubName}
                                </span>

                                <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                  {membership.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/students/${student.roll_number}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}