import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function AdminPage() {
  const { supabase, student } = await requireAdmin()

  const [
    { count: studentCount },
    { count: activeAccountCount },
    { data: activeMemberships },
    { count: clubCount },
    { count: pendingRequestCount },
    { count: adminCount },
  ] = await Promise.all([
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .not('auth_user_id', 'is', null),

    supabase
      .from('club_members')
      .select('student_id, role')
      .eq('status', 'ACTIVE'),

    supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),

    supabase
      .from('club_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),

    supabase
      .from('admin_roles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
  ])

  const uniqueClubMembers = new Set(
    (activeMemberships ?? []).map(
      (membership) => membership.student_id
    )
  ).size

  const uniqueClubLeaders = new Set(
    (activeMemberships ?? [])
      .filter(
        (membership) =>
          membership.role === 'HEAD' ||
          membership.role === 'COORDINATOR'
      )
      .map((membership) => membership.student_id)
  ).size

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Thaara Theeram
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">

            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              My Dashboard
            </Link>

            <Link
              href="/admin/clubs"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:block"
            >
              Clubs
            </Link>

            <LogoutButton />

          </nav>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-10">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Thaara Theeram
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-slate-600">
                Welcome, {student.name}.
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Platform Admin
            </span>

          </div>
        </div>

        {/* Platform overview */}
        <section>

          <div className="mb-5">
            <p className="text-sm font-semibold text-blue-600">
              Platform Overview
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              What's happening
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick view of the student and club ecosystem.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <StatCard
              label="Students"
              value={studentCount ?? 0}
              description="Students in the college roster"
            />

            <StatCard
              label="Active Accounts"
              value={activeAccountCount ?? 0}
              description="Students who activated their account"
            />

            <StatCard
              label="Club Members"
              value={uniqueClubMembers}
              description="Students with an active club membership"
            />

            <StatCard
              label="Club Leaders"
              value={uniqueClubLeaders}
              description="Heads and Coordinators"
            />

            <StatCard
              label="Active Clubs"
              value={clubCount ?? 0}
              description="Currently active clubs"
            />

            <StatCard
              label="Pending Requests"
              value={pendingRequestCount ?? 0}
              description="Club proposals awaiting review"
            />

          </div>
        </section>

        {/* Management */}
        <section className="mt-12">

          <div className="mb-5">
            <p className="text-sm font-semibold text-blue-600">
              Platform Management
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Manage Thaara Theeram
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Access the areas you are responsible for as a Platform Admin.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <AdminCard
              title="Clubs"
              description="View, manage, archive and restore clubs on Thaara Theeram."
              href="/admin/clubs"
              action="Manage Clubs →"
            />

            <AdminCard
              title="Club Requests"
              description="Review and decide on requests to create new clubs."
              href="/admin/requests"
              badge={
                pendingRequestCount
                  ? `${pendingRequestCount} pending`
                  : 'All clear'
              }
              action="Review Requests →"
            />

            <AdminCard
              title="Students"
              description="View the college roster, account activation status and student profiles."
              href="/admin/students"
              action="Manage Students →"
            />

            <AdminCard
              title="Administrators"
              description="Manage who has Platform Admin responsibility and review admin access."
              badge={`${adminCount ?? 0} active`}
              href="/admin/administrators"
              action="Manage Administrators →"
            />

            <AdminCard
              title="Activity & Audit"
              description="Review important platform actions, role changes and administrative activity."
              href="/admin/activity"
              action="View Activity →"
            />

          </div>
        </section>

        {/* Admin responsibility */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Signed in as
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {student.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {student.roll_number}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                {student.department} • {student.year} • Section{' '}
                {student.section}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Responsibility
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                Platform Administration
              </p>

              <p className="mt-1 text-sm text-slate-500">
                You remain a student account with additional admin
                responsibility.
              </p>
            </div>

          </div>

        </section>

      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <span>
            © 2026 Thaara Theeram
          </span>

          <Link
            href="/"
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Back to Thaara Theeram →
          </Link>

        </div>
      </footer>

    </main>
  )
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>

    </div>
  )
}

function AdminCard({
  title,
  description,
  badge,
  href,
  action,
  comingSoon = false,
}: {
  title: string
  description: string
  badge?: string
  href?: string
  action?: string
  comingSoon?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
        href
          ? 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md'
          : 'border-slate-200'
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {badge && (
          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {badge}
          </span>
        )}

      </div>

      {href && (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {action ?? 'Open →'}
        </Link>
      )}

      {comingSoon && (
        <span className="mt-5 inline-flex rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
          Coming next
        </span>
      )}

    </div>
  )
}