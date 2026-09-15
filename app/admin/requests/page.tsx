import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export default async function AdminRequestsPage() {
  const { supabase } = await requireAdmin()

  const { data: requests, error } = await supabase
    .from('club_requests')
    .select(`
      id,
      club_name,
      category,
      description,
      reason,
      status,
      created_at,
      reviewed_at,
      requested_by,
      students!club_requests_requested_by_fkey (
        name,
        roll_number,
        department,
        year,
        section
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const allRequests = requests ?? []

  const pendingCount = allRequests.filter(
    (request) => request.status === 'PENDING'
  ).length

  const approvedCount = allRequests.filter(
    (request) => request.status === 'APPROVED'
  ).length

  const rejectedCount = allRequests.filter(
    (request) => request.status === 'REJECTED'
  ).length

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))

  const getStatusStyles = (status: RequestStatus) => {
    if (status === 'PENDING') {
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    }

    if (status === 'APPROVED') {
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    }

    return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/admin"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="mt-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Thaara Theeram
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Club Requests
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Review and manage requests from students who want to start
                something new on campus.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              {pendingCount} pending
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Requests
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {allRequests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Pending
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-800">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Approved
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              Rejected
            </p>
            <p className="mt-2 text-2xl font-bold text-red-800">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Requests */}
        <div className="mt-8">
          {allRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                ✦
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-800">
                No club requests yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                When students submit a request to start a club, it will appear
                here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allRequests.map((request) => {
                const requester = Array.isArray(request.students)
                  ? request.students[0]
                  : request.students

                const status = request.status as RequestStatus

                return (
                  <article
                    key={request.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Title */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900">
                            {request.club_name}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        {/* Category */}
                        {request.category && (
                          <div className="mt-3">
                            <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {request.category}
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {request.description && (
                          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                            {request.description}
                          </p>
                        )}

                        {/* Requester + date */}
                        <div className="mt-6 grid gap-5 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Requested By
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {requester?.name ?? 'Not specified'}
                            </p>

                            {requester?.roll_number && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {requester.roll_number}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Department
                            </p>

                            <p className="mt-1 font-medium text-slate-800">
                              {requester?.department ?? 'Not specified'}
                            </p>

                            {requester?.year && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {requester.year}
                                {requester.section
                                  ? ` • Section ${requester.section}`
                                  : ''}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Submitted
                            </p>

                            <p className="mt-1 font-medium text-slate-800">
                              {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Review */}
                      <div className="shrink-0">
                        <Link
                          href={`/admin/requests/${request.id}`}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                        >
                          {status === 'PENDING' ? 'Review Request' : 'View Request'}
                          <span className="ml-2">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}