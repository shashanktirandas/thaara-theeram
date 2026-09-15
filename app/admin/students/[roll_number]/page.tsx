import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'

type PageProps = {
  params: Promise<{
    roll_number: string
  }>
}

export default async function AdminStudentDetailsPage({
  params,
}: PageProps) {
  const { roll_number } = await params
  const { supabase } = await requireAdmin()

  // --------------------------------------------------
  // Student
  // --------------------------------------------------

  const { data: student, error: studentError } = await supabase
    .from('students')
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
      skills,
      auth_user_id,
      created_at,
      updated_at
    `)
    .eq('roll_number', roll_number)
    .single()

  if (studentError || !student) {
    notFound()
  }

  // --------------------------------------------------
  // Active club memberships
  // --------------------------------------------------

  const { data: memberships } = await supabase
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
        status
      )
    `)
    .eq('student_id', student.id)
    .order('joined_at', { ascending: false })

  // --------------------------------------------------
  // Applications
  // --------------------------------------------------

  const { data: applications } = await supabase
    .from('club_applications')
    .select(`
      id,
      message,
      status,
      submitted_at,
      reviewed_at,
      clubs (
        name,
        slug
      )
    `)
    .eq('student_id', student.id)
    .order('submitted_at', { ascending: false })

  // --------------------------------------------------
  // Admin status
  // --------------------------------------------------

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select(`
      id,
      status,
      granted_at,
      accepted_at,
      revoked_at
    `)
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const activeMemberships =
    (memberships ?? []).filter(
      (membership) => membership.status === 'ACTIVE'
    )

  const activeClubs = activeMemberships
    .map((membership) => {
      const club = Array.isArray(membership.clubs)
        ? membership.clubs[0]
        : membership.clubs

      return {
        ...membership,
        club,
      }
    })
    .filter((membership) => membership.club)

  const clubApplications =
    (applications ?? []).map((application) => {
      const club = Array.isArray(application.clubs)
        ? application.clubs[0]
        : application.clubs

      return {
        ...application,
        club,
      }
    })

  const initials = student.name
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Back */}
        <Link
          href="/admin/students"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Students
        </Link>

        {/* Header */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Profile image */}
              {student.profile_photo_url ? (
                <img
                  src={student.profile_photo_url}
                  alt={student.name}
                  className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/20"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white ring-4 ring-white/20">
                  {initials}
                </div>
              )}

              <div className="flex-1 text-white">
                <p className="text-sm font-medium text-blue-100">
                  Student Profile
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                  {student.name}
                </h1>

                <p className="mt-2 text-blue-100">
                  {student.roll_number}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    student.auth_user_id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-white/15 text-white'
                  }`}
                >
                  {student.auth_user_id
                    ? 'Account Active'
                    : 'Not Activated'}
                </span>
              </div>
            </div>
          </div>

          {/* Academic information */}
          <div className="grid gap-6 px-8 py-7 sm:grid-cols-3">
            <InfoItem
              label="Department"
              value={student.department}
            />

            <InfoItem
              label="Year"
              value={student.year}
            />

            <InfoItem
              label="Section"
              value={student.section}
            />
          </div>
        </section>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* Left / main */}
          <div className="space-y-8 lg:col-span-2">

            {/* Contact / account */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionTitle
                title="Student Information"
                description="College and account information"
              />

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={student.name}
                />

                <InfoItem
                  label="Roll Number"
                  value={student.roll_number}
                />

                <InfoItem
                  label="College Email"
                  value={student.college_email}
                />

                <InfoItem
                  label="Account"
                  value={
                    student.auth_user_id
                      ? 'Activated'
                      : 'Not activated'
                  }
                />
              </div>
            </section>

            {/* Clubs */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionTitle
                title="Club Involvement"
                description="Every active club and role held by this student"
              />

              <div className="mt-6 space-y-4">
                {activeClubs.length === 0 ? (
                  <EmptyState
                    title="No active clubs"
                    description="This student is not currently a member of any club."
                  />
                ) : (
                  activeClubs.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900">
                            {membership.club.name}
                          </h3>

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {membership.role}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {membership.club.category || 'Club'}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          Joined{' '}
                          {formatDate(membership.joined_at)}
                        </p>
                      </div>

                      <Link
                        href={`/clubs/${membership.club.slug}`}
                        target="_blank"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Club →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Applications */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionTitle
                title="Club Applications"
                description="Application history for this student"
              />

              <div className="mt-6 space-y-4">
                {clubApplications.length === 0 ? (
                  <EmptyState
                    title="No applications"
                    description="This student has not submitted any club applications."
                  />
                ) : (
                  clubApplications.map((application) => (
                    <div
                      key={application.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {application.club?.name ?? 'Unknown Club'}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Submitted{' '}
                            {formatDate(application.submitted_at)}
                          </p>
                        </div>

                        <ApplicationStatus
                          status={application.status}
                        />
                      </div>

                      {application.message && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                          {application.message}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* Right sidebar */}
          <aside className="space-y-8">

            {/* Club summary */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionTitle
                title="Involvement Summary"
                description="Current Thaara Theeram activity"
              />

              <div className="mt-6 space-y-5">
                <SummaryItem
                  label="Active Clubs"
                  value={String(activeClubs.length)}
                />

                <SummaryItem
                  label="Heads"
                  value={String(
                    activeClubs.filter(
                      (item) => item.role === 'HEAD'
                    ).length
                  )}
                />

                <SummaryItem
                  label="Coordinators"
                  value={String(
                    activeClubs.filter(
                      (item) => item.role === 'COORDINATOR'
                    ).length
                  )}
                />

                <SummaryItem
                  label="Member Roles"
                  value={String(
                    activeClubs.filter(
                      (item) => item.role === 'MEMBER'
                    ).length
                  )}
                />
              </div>
            </section>

            {/* Admin status */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <SectionTitle
                title="Platform Access"
                description="Administrative responsibility"
              />

              <div className="mt-6">
                {adminRole?.status === 'ACTIVE' ? (
                  <div className="rounded-2xl bg-blue-50 p-5">
                    <p className="font-semibold text-blue-900">
                      Platform Administrator
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      This student has active Admin privileges.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="font-semibold text-slate-800">
                      No active Admin role
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      This student is not currently a platform
                      administrator.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Profile content */}
            {(student.bio ||
              student.interests ||
              student.skills) && (
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <SectionTitle
                  title="Profile"
                  description="Student-provided profile information"
                />

                <div className="mt-6 space-y-5">
                  {student.bio && (
                    <ProfileField
                      label="Bio"
                      value={student.bio}
                    />
                  )}

                  {student.interests && (
                    <ProfileField
                      label="Interests"
                      value={student.interests}
                    />
                  )}

                  {student.skills && (
                    <ProfileField
                      label="Skills"
                      value={student.skills}
                    />
                  )}
                </div>
              </section>
            )}

          </aside>
        </div>
      </div>
    </main>
  )
}

// --------------------------------------------------
// Components
// --------------------------------------------------

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-900">
        {value || '—'}
      </p>
    </div>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  )
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-xl font-bold text-slate-900">
        {value}
      </span>
    </div>
  )
}

function ApplicationStatus({
  status,
}: {
  status: string
}) {
  const styles =
    status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'REJECTED'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700'

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
      <p className="font-medium text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  )
}

function ProfileField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {value}
      </p>
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}