import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'
import HeadshipTransferRequest from '@/components/dashboard/HeadshipTransferRequest'
import AdminInvitation from '@/components/AdminInvitation'
import NotificationBell from '@/components/notifications/NotificationBell'
import ApplicationsManager from '@/components/clubs/ApplicationsManager'

type Membership = {
  role: 'MEMBER' | 'COORDINATOR' | 'HEAD'
  status: string
  clubs:
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }[]
    | null
}

type Application = {
  id: string
  status: string
  submitted_at: string
  clubs:
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }[]
    | null
}

type ClubRequest = {
  id: string
  club_name: string
  category: string | null
  description: string | null
  reason: string | null
  status: string
  created_at: string
  reviewed_at: string | null
}

function getClub(
  clubs: Membership['clubs'] | Application['clubs']
) {
  return Array.isArray(clubs) ? clubs[0] : clubs
}

function roleLabel(role: string) {
  if (role === 'HEAD') return 'Head'
  if (role === 'COORDINATOR') return 'Coordinator'
  return 'Member'
}

function roleClasses(role: string) {
  if (role === 'HEAD') {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  if (role === 'COORDINATOR') {
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return 'bg-slate-50 text-slate-600 border-slate-200'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnTo=/dashboard')
  }

  const { data: student } = await supabase
    .from('students')
    .select(`
      id,
      name,
      roll_number,
      department,
      year,
      section,
      profile_photo_url,
      bio
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!student) {
    redirect('/login')
  }

  const { data: memberships } = await supabase
    .from('club_members')
    .select(`
      role,
      status,
      clubs (
        id,
name,
slug,
category,
logo_url,
short_description
      )
    `)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .order('role', { ascending: true })

  const { data: applications } = await supabase
    .from('club_applications')
    .select(`
      id,
      status,
      submitted_at,
      clubs (
  id,
  name,
  slug,
  category,
  logo_url,
  short_description
)
    `)
    .eq('student_id', student.id)
    .eq('status', 'PENDING')
    .order('submitted_at', { ascending: false })

  const { data: clubRequests } = await supabase
    .from('club_requests')
    .select(`
      id,
      club_name,
      category,
      description,
      reason,
      status,
      created_at,
      reviewed_at
    `)
    .eq('requested_by', student.id)
    .order('created_at', { ascending: false })

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('status')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()
const { data: pendingAdminInvitation } =
  await supabase
    .from('admin_roles')
    .select('id, status, created_at')
    .eq('student_id', student.id)
    .eq('status', 'PENDING')
    .maybeSingle()
  const activeMemberships = (memberships ?? []) as Membership[]
  const pendingApplications = (applications ?? []) as Application[]
  const requests = (clubRequests ?? []) as ClubRequest[]

  const isAdmin = !!adminRole
  const hasHeadRole = activeMemberships.some(
    (membership) => membership.role === 'HEAD'
  )
  const hasCoordinatorRole = activeMemberships.some(
    (membership) => membership.role === 'COORDINATOR'
  )

  const leadershipClubs = activeMemberships.filter(
    (membership) =>
      membership.role === 'HEAD' ||
      membership.role === 'COORDINATOR'
  )

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Thaara Theeram
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5">
  <Link
  href="/profile"
  className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:block"
>
  Profile
</Link>
  <Link
    href="/clubs"
    className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:block"
  >
    Explore Clubs
  </Link>

  <Link
    href="/requests/new"
    className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 md:block"
  >
    Start a Club
  </Link>

  <NotificationBell />

  {isAdmin && (
    <Link
      href="/admin"
      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
    >
      Admin
    </Link>
  )}

  <LogoutButton />
</nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Profile */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-bold">
              {student.profile_photo_url ? (
                <img
                  src={student.profile_photo_url}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                student.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Student Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {student.name}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                {student.roll_number} · {student.department} ·{' '}
                {student.year} · Section {student.section}
              </p>
            </div>

            {isAdmin && (
              <div className="sm:ml-auto">
                <span className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Platform Admin
                </span>
              </div>
            )}
          </div>

          {student.bio && (
            <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600">
              {student.bio}
            </p>
          )}
        </section>

        {/* Capability overview */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Clubs
            </p>
            <p className="mt-2 text-2xl font-bold">
              {activeMemberships.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Active memberships
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Applications
            </p>
            <p className="mt-2 text-2xl font-bold">
              {pendingApplications.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Awaiting review
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Leadership
            </p>
            <p className="mt-2 text-2xl font-bold">
              {leadershipClubs.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Clubs you help lead
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Requests
            </p>
            <p className="mt-2 text-2xl font-bold">
              {requests.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Club proposals
            </p>
          </div>

        </section>

        {/* Role capabilities */}
        {(hasHeadRole || hasCoordinatorRole || isAdmin) && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Your responsibilities
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Manage what you’re responsible for
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your account can carry multiple responsibilities at the same time.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {leadershipClubs.map((membership) => {
                const club = getClub(membership.clubs)

                if (!club) return null

                return (
                  <div
                    key={`${club.id}-${membership.role}`}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {club.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {club.category || 'Club'}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleClasses(
                          membership.role
                        )}`}
                      >
                        {roleLabel(membership.role)}
                      </span>
                    </div>

                    <Link
                      href={`/clubs/${club.slug}/manage`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Manage Club
                    </Link>

                    {membership.role === 'HEAD' && (
                      <div className="mt-3">
                        <HeadshipTransferRequest
                          slug={club.slug}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {isAdmin && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      Platform Admin
                    </span>

                    <h3 className="mt-4 font-semibold">
                      Platform Administration
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Manage clubs, students, requests, and platform administration.
                    </p>
                  </div>

                  <Link
                    href="/admin"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open Admin Dashboard
                  </Link>
                </div>
              )}

            </div>
          </section>
        )}

        {/* My Clubs */}
        <section className="mt-12">

          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Your communities
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                My Clubs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Every club and role connected to your account.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {activeMemberships.length} clubs
            </span>
          </div>

          {activeMemberships.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {activeMemberships.map((membership) => {
                const club = getClub(membership.clubs)

                if (!club) return null

                return (
                  <div
                    key={`${club.id}-${membership.role}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link href={`/clubs/${club.slug}`}>
                      <div className="flex h-32 items-center justify-center bg-slate-100">
                        {club.logo_url ? (
                          <img
                            src={club.logo_url}
                            alt={club.name}
                            className="h-20 w-20 object-contain"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-slate-400">
                            {club.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">
                          {club.name}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${roleClasses(
                            membership.role
                          )}`}
                        >
                          {roleLabel(membership.role)}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {club.short_description ||
                          'A Thaara Theeram club.'}
                      </p>

                      <div className="mt-5 flex gap-2">
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-slate-50"
                        >
                          Open
                        </Link>

                        {(membership.role === 'HEAD' ||
                          membership.role === 'COORDINATOR') && (
                          <Link
                            href={`/clubs/${club.slug}/manage`}
                            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Manage
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-medium">
                You haven't joined any clubs yet.
              </p>

              <Link
                href="/"
                className="mt-3 inline-block text-sm font-semibold text-blue-600 underline"
              >
                Discover clubs
              </Link>
            </div>
          )}
        </section>
          {pendingAdminInvitation && (
  <div className="mt-8">
    <AdminInvitation />
  </div>
)}
{/* Applications to my clubs
{leadershipClubs.length > 0 && (
  <section className="mt-12">
    <div>
      <p className="text-sm font-semibold text-blue-600">
        Club management
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        Applications to Your Clubs
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Review students who want to join the clubs you manage.
      </p>
    </div>

    <div className="mt-6 space-y-6">
      {leadershipClubs.map((membership) => {
        const club = getClub(membership.clubs)

        if (!club) return null

        return (
          <div
            key={`${club.id}-${membership.role}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {club.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  You are the {roleLabel(membership.role)}
                </p>
              </div>

              <Link
                href={`/clubs/${club.slug}`}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                View Club →
              </Link>
            </div>

            <ApplicationsManager slug={club.slug} />
          </div>
        )
      })}
    </div>
  </section>
)} */}
        {/* Pending applications */}
        <section className="mt-12">

          <div>
            <p className="text-sm font-semibold text-blue-600">
              Club applications
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Pending Applications
            </h2>
          </div>

          {pendingApplications.length > 0 ? (
            <div className="mt-6 space-y-3">

              {pendingApplications.map((application) => {
                const club = getClub(application.clubs)

                if (!club) return null

                return (
                  <Link
                    key={application.id}
                    href={`/clubs/${club.slug}`}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {club.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {club.category || 'Club'}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  </Link>
                )
              })}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
              <p className="text-sm text-slate-500">
                You don't have any pending applications.
              </p>
            </div>
          )}
        </section>

        {/* Club requests */}
        <section className="mt-12">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Build something new
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                My Club Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track clubs you've requested to start.
              </p>
            </div>

            <Link
              href="/requests/new"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Start a Club →
            </Link>
          </div>

          {requests.length > 0 ? (
            <div className="mt-6 space-y-4">

              {requests.map((request, index) => {
                const statusClasses = {
                  PENDING: 'bg-amber-50 text-amber-700',
                  APPROVED: 'bg-emerald-50 text-emerald-700',
                  REJECTED: 'bg-red-50 text-red-700',
                }

                const previousSameClub = requests
                  .slice(0, index)
                  .some(
                    (item) =>
                      item.club_name.trim().toLowerCase() ===
                      request.club_name.trim().toLowerCase()
                  )

                const isLatestRequest = !previousSameClub

                return (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <h3 className="font-semibold">
                          {request.club_name}
                        </h3>

                        {request.category && (
                          <p className="mt-1 text-sm text-slate-500">
                            {request.category}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          Submitted{' '}
                          {new Date(
                            request.created_at
                          ).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusClasses[
                              request.status as keyof typeof statusClasses
                            ] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {request.status}
                        </span>

                        {request.status === 'REJECTED' &&
                          isLatestRequest && (
                            <Link
                              href={`/requests/new?reapply=${request.id}`}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Reapply
                            </Link>
                          )}
                      </div>
                    </div>

                    {request.status === 'APPROVED' && (
                      <p className="mt-4 text-sm font-medium text-emerald-700">
                        Your club has been approved. You are the initial Head.
                      </p>
                    )}

                    {request.status === 'PENDING' && (
                      <p className="mt-4 text-sm text-slate-500">
                        Your request is currently under Admin review.
                      </p>
                    )}

                    {request.status === 'REJECTED' && (
                      <p className="mt-4 text-sm text-red-600">
                        {isLatestRequest
                          ? 'This request was rejected. You can improve your proposal and apply again.'
                          : 'This request was rejected and is kept here as part of your request history.'}
                      </p>
                    )}
                  </div>
                )
              })}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-medium">
                You haven't requested a club yet.
              </p>

              <Link
                href="/requests/new"
                className="mt-3 inline-block text-sm font-semibold text-blue-600 underline"
              >
                Start a new club
              </Link>
            </div>
          )}
        </section>

      </section>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-500">
          © 2026 Thaara Theeram
        </div>
      </footer>

    </main>
  )
}