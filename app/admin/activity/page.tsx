'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Activity = {
  id: string
  actor_student_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, any> | null
  created_at: string
  actor:
    | {
        id: string
        name: string
        roll_number: string
        department: string | null
        year: string | null
        section: string | null
      }
    | {
        id: string
        name: string
        roll_number: string
        department: string | null
        year: string | null
        section: string | null
      }[]
    | null
}

type ApiResponse = {
  success: boolean
  activities: Activity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

const actionGroups = [
  { label: 'All actions', value: '' },
  { label: 'Applications', value: 'APPLICATION' },
  { label: 'Members', value: 'MEMBER' },
  { label: 'Roles', value: 'ROLE' },
  { label: 'Leadership', value: 'HEAD' },
  { label: 'Clubs', value: 'CLUB' },
  { label: 'Administrators', value: 'ADMIN' },
]

function getActor(activity: Activity) {
  if (Array.isArray(activity.actor)) {
    return activity.actor[0] ?? null
  }

  return activity.actor
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    CLUB_CREATED: 'Club created',
    CLUB_ARCHIVED: 'Club archived',
    CLUB_RESTORED: 'Club restored',
    CLUB_TRASHED: 'Club moved to trash',

    CLUB_MEMBER_ADDED: 'Member added',
    CLUB_MEMBER_REMOVED: 'Member removed',

    CLUB_ROLE_CHANGED: 'Member role changed',
    MEMBER_ROLE_CHANGED: 'Member role changed',

    CLUB_APPLICATION_APPROVED:
      'Club application approved',
    CLUB_APPLICATION_REJECTED:
      'Club application rejected',

    APPLICATION_APPROVED:
      'Membership application approved',
    APPLICATION_REJECTED:
      'Membership application rejected',

    HEAD_TRANSFER_REQUESTED:
      'Head transfer requested',
    HEAD_TRANSFER_ACCEPTED:
      'Head transfer accepted',
    HEAD_TRANSFER_REJECTED:
      'Head transfer rejected',

    ADMIN_ADDED: 'Administrator added',
    ADMIN_REMOVED: 'Administrator removed',

    CLUB_REQUEST_APPROVED:
      'Club request approved',
    CLUB_REQUEST_REJECTED:
      'Club request rejected',

    CLUB_IDENTITY_UPDATED:
      'Club identity updated',

    CLUB_ANNOUNCEMENT_CREATED:
      'Announcement created',
    CLUB_ANNOUNCEMENT_DELETED:
      'Announcement deleted',
  }

  return (
    labels[action] ||
    action
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  )
}

function getActionDescription(activity: Activity) {
  const metadata = activity.metadata ?? {}
  const actor = getActor(activity)
  const actorName = actor?.name ?? 'Someone'

  const targetName =
    metadata.student_name ||
    metadata.target_student_name ||
    metadata.name ||
    null

  const clubName =
    metadata.club_name ||
    metadata.club ||
    null

  switch (activity.action) {
    case 'CLUB_MEMBER_ADDED':
      return targetName
        ? `${actorName} added ${targetName}${
            clubName ? ` to ${clubName}` : ''
          }.`
        : `${actorName} added a student to a club.`

    case 'CLUB_MEMBER_REMOVED':
      return targetName
        ? `${actorName} removed ${targetName}${
            clubName ? ` from ${clubName}` : ''
          }.`
        : `${actorName} removed a club member.`

    case 'CLUB_ROLE_CHANGED':
    case 'MEMBER_ROLE_CHANGED':
      return targetName
        ? `${actorName} changed ${targetName}'s club role${
            clubName ? ` in ${clubName}` : ''
          }.`
        : `${actorName} changed a member's role.`

    case 'HEAD_TRANSFER_REQUESTED':
      return `${actorName} requested a Head transition${
        clubName ? ` for ${clubName}` : ''
      }.`

    case 'HEAD_TRANSFER_ACCEPTED':
      return `${actorName} accepted a Head transition${
        clubName ? ` for ${clubName}` : ''
      }.`

    case 'HEAD_TRANSFER_REJECTED':
      return `${actorName} rejected a Head transition${
        clubName ? ` for ${clubName}` : ''
      }.`

    case 'CLUB_REQUEST_APPROVED':
      return `${actorName} approved a request to create a club.`

    case 'CLUB_REQUEST_REJECTED':
      return `${actorName} rejected a request to create a club.`

    case 'ADMIN_ADDED':
      return `${actorName} added a new Platform Administrator.`

    case 'ADMIN_REMOVED':
      return `${actorName} removed Platform Administrator access.`

    case 'CLUB_IDENTITY_UPDATED':
      return `${actorName} updated club identity information${
        clubName ? ` for ${clubName}` : ''
      }.`

    case 'CLUB_ANNOUNCEMENT_CREATED':
      return `${actorName} created a club announcement${
        clubName ? ` for ${clubName}` : ''
      }.`

    case 'CLUB_ANNOUNCEMENT_DELETED':
      return `${actorName} deleted a club announcement${
        clubName ? ` from ${clubName}` : ''
      }.`

    default:
      return `${actorName} performed this action.`
  }
}

function getActionCategory(action: string) {
  if (
    action.includes('APPLICATION')
  ) {
    return 'Applications'
  }

  if (
    action.includes('MEMBER')
  ) {
    return 'Members'
  }

  if (
    action.includes('ROLE')
  ) {
    return 'Roles'
  }

  if (
    action.includes('HEAD')
  ) {
    return 'Leadership'
  }

  if (
    action.includes('ADMIN')
  ) {
    return 'Administrators'
  }

  if (
    action.includes('CLUB')
  ) {
    return 'Clubs'
  }

  return 'Platform'
}

function getActionIcon(action: string) {
  if (action.includes('APPLICATION')) return '✓'
  if (action.includes('MEMBER')) return '●'
  if (action.includes('ROLE')) return '↗'
  if (action.includes('HEAD')) return '★'
  if (action.includes('ADMIN')) return '◆'
  if (action.includes('CLUB')) return '◇'

  return '•'
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatRelativeTime(value: string) {
  const difference =
    Date.now() - new Date(value).getTime()

  const minutes = Math.floor(
    difference / (1000 * 60)
  )

  if (minutes < 1) {
    return 'Just now'
  }

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)

  if (days < 7) {
    return `${days}d ago`
  }

  return formatDateTime(value)
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<
    Activity[]
  >([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [actionFilter, setActionFilter] =
    useState('')

  const [page, setPage] =
    useState(1)

  const [total, setTotal] =
    useState(0)

  const [totalPages, setTotalPages] =
    useState(1)

  const limit = 25

  async function loadActivity(
    requestedPage = page
  ) {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()

      params.set(
        'page',
        String(requestedPage)
      )

      params.set(
        'limit',
        String(limit)
      )

      if (search.trim()) {
        params.set(
          'search',
          search.trim()
        )
      }

      if (actionFilter) {
        params.set(
          'action',
          actionFilter
        )
      }

      const response = await fetch(
        `/api/admin/activity?${params.toString()}`,
        {
          cache: 'no-store',
        }
      )

      const data: ApiResponse =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to load activity.'
        )
      }

      setActivities(
        data.activities || []
      )

      setTotal(
        data.pagination?.total || 0
      )

      setTotalPages(
        data.pagination?.totalPages || 1
      )

      setPage(
        data.pagination?.page ||
          requestedPage
      )
    } catch (err) {
      console.error(
        'Activity page error:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivity(1)
  }, [actionFilter])

  const visibleActivities =
    useMemo(() => {
      const query =
        search.trim().toLowerCase()

      if (!query) {
        return activities
      }

      return activities.filter(
        (activity) => {
          const actor =
            getActor(activity)

          const text = [
            activity.action,
            activity.entity_type,
            actor?.name,
            actor?.roll_number,
            JSON.stringify(
              activity.metadata ?? {}
            ),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return text.includes(query)
        }
      )
    }, [activities, search])

  function handleSearchSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()
    loadActivity(1)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-slate-950">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <Link
            href="/admin"
            className="text-sm font-semibold text-[#0B3B82] hover:underline"
          >
            ← Back to Admin
          </Link>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
                Platform Management
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
                Activity & Audit
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review important actions and
                administrative activity across
                Thaara Theeram.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[#0B3B82] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#082f69]"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* SUMMARY */}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">
              Total Records
            </p>

            <p className="mt-2 text-3xl font-black text-[#092B5F]">
              {loading ? '—' : total}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Recorded platform activity
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">
              Showing
            </p>

            <p className="mt-2 text-3xl font-black text-[#092B5F]">
              {loading
                ? '—'
                : visibleActivities.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Records on this page
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">
              Current Page
            </p>

            <p className="mt-2 text-3xl font-black text-[#092B5F]">
              {page}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              of {totalPages}
            </p>
          </div>
        </div>

        {/* FILTERS */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <form
              onSubmit={
                handleSearchSubmit
              }
              className="flex flex-1 gap-2"
            >
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by student, roll number or activity..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0B3B82] focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="submit"
                className="rounded-xl bg-[#0B3B82] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#082f69]"
              >
                Search
              </button>
            </form>

            <select
              value={actionFilter}
              onChange={(event) =>
                setActionFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0B3B82]"
            >
              {actionGroups.map(
                (group) => (
                  <option
                    key={group.value}
                    value={group.value}
                  >
                    {group.label}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-800">
              Unable to load activity
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadActivity(page)
              }
              className="mt-4 rounded-lg bg-[#0B3B82] px-4 py-2 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* ACTIVITY */}

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
              Platform History
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#092B5F]">
              Recent activity
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  />
                )
              )}
            </div>
          ) : visibleActivities.length ===
            0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFD] text-xl text-[#0B3B82]">
                ◇
              </div>

              <h3 className="mt-5 text-lg font-black text-[#092B5F]">
                No activity found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no audit records
                matching the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden border-b border-slate-100 bg-[#F8FAFD] px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 md:grid md:grid-cols-[1.5fr_1fr_1.3fr_auto] md:gap-6">
                <div>Activity</div>
                <div>Performed By</div>
                <div>Target</div>
                <div>Time</div>
              </div>

              <div className="divide-y divide-slate-100">
                {visibleActivities.map(
                  (activity) => {
                    const actor =
                      getActor(activity)

                    const metadata =
                      activity.metadata ??
                      {}

                    const clubName =
                      metadata.club_name ||
                      metadata.club ||
                      metadata.club_slug ||
                      null

                    const targetName =
                      metadata.student_name ||
                      metadata.target_student_name ||
                      metadata.name ||
                      null

                    return (
                      <article
                        key={activity.id}
                        className="px-5 py-5 transition hover:bg-[#F8FAFD] sm:px-6"
                      >
                        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1.3fr_auto] md:items-center md:gap-6">
                          {/* ACTIVITY */}

                          <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0B3B82]">
                              {getActionIcon(
                                activity.action
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-black text-[#092B5F]">
                                  {getActionLabel(
                                    activity.action
                                  )}
                                </h3>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  {getActionCategory(
                                    activity.action
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 text-sm leading-5 text-slate-500">
                                {getActionDescription(
                                  activity
                                )}
                              </p>
                            </div>
                          </div>

                          {/* ACTOR */}

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 md:hidden">
                              Performed by
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700 md:mt-0">
                              {actor?.name ||
                                'System'}
                            </p>

                            {actor?.roll_number && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {actor.roll_number}
                              </p>
                            )}
                          </div>

                          {/* TARGET */}

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 md:hidden">
                              Target
                            </p>

                            {clubName ? (
                              <>
                                <p className="mt-1 text-sm font-bold text-slate-700 md:mt-0">
                                  {clubName}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Club
                                </p>
                              </>
                            ) : targetName ? (
                              <>
                                <p className="mt-1 text-sm font-bold text-slate-700 md:mt-0">
                                  {targetName}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Student
                                </p>
                              </>
                            ) : (
                              <p className="mt-1 text-sm text-slate-400 md:mt-0">
                                Platform
                              </p>
                            )}
                          </div>

                          {/* TIME */}

                          <div className="text-left md:text-right">
                            <p className="text-sm font-semibold text-slate-600">
                              {formatRelativeTime(
                                activity.created_at
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatDateTime(
                                activity.created_at
                              )}
                            </p>
                          </div>
                        </div>

                        {/* METADATA */}

                        {Object.keys(
                          metadata
                        ).length > 0 && (
                          <details className="mt-4 border-t border-slate-100 pt-3">
                            <summary className="cursor-pointer text-xs font-bold text-[#0B3B82]">
                              View details
                            </summary>

                            <pre className="mt-3 overflow-x-auto rounded-xl bg-[#F8FAFD] p-4 text-[11px] leading-5 text-slate-600">
                              {JSON.stringify(
                                metadata,
                                null,
                                2
                              )}
                            </pre>
                          </details>
                        )}
                      </article>
                    )
                  }
                )}
              </div>
            </div>
          )}
        </section>

        {/* PAGINATION */}

        {!loading &&
          totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Page{' '}
                <span className="font-bold text-slate-800">
                  {page}
                </span>{' '}
                of{' '}
                <span className="font-bold text-slate-800">
                  {totalPages}
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    loadActivity(
                      page - 1
                    )
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    loadActivity(
                      page + 1
                    )
                  }
                  className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

        {/* FOOTER NOTE */}

        <div className="mt-8 rounded-2xl border border-yellow-100 bg-yellow-50 px-5 py-4">
          <p className="text-xs leading-5 text-yellow-800">
            <strong>Audit records are historical.</strong>{' '}
            They are intended to provide
            accountability for important platform
            actions and should not be edited as part
            of normal administration.
          </p>
        </div>
      </div>
    </main>
  )
}