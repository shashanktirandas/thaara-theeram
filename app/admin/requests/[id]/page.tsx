import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import ClubRequestDecision from '@/components/admin/ClubRequestDecision'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export default async function AdminRequestReviewPage({
  params,
}: PageProps) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { data: request, error } = await supabase
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
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  const requester = Array.isArray(request.students)
    ? request.students[0]
    : request.students

  const status = request.status as RequestStatus

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))

  const statusStyles =
    status === 'PENDING'
      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      : status === 'APPROVED'
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-red-50 text-red-700 ring-1 ring-red-200'

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/admin/requests"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          ← Back to Club Requests
        </Link>

        {/* Header */}
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Thaara Theeram
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Review Club Request
              </h1>

              <p className="mt-2 text-slate-600">
                Review the proposal and requester before making a decision.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${statusStyles}`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Club Details */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Proposed Club
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {request.club_name}
                </h2>
              </div>

              {request.category && (
                <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {request.category}
                </span>
              )}
            </div>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                About the Club
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {request.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Why should this club be created?
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {request.reason || 'No reason provided.'}
              </p>
            </div>
          </section>

          {/* Requester */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Student
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Requester
              </h2>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="mt-1 font-medium text-slate-800">
                  {requester?.name ?? 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Roll Number</p>
                <p className="mt-1 font-medium text-slate-800">
                  {requester?.roll_number ?? 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="mt-1 font-medium text-slate-800">
                  {requester?.department ?? 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Year</p>
                <p className="mt-1 font-medium text-slate-800">
                  {requester?.year ?? 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Section</p>
                <p className="mt-1 font-medium text-slate-800">
                  {requester?.section ?? 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Submitted</p>
                <p className="mt-1 font-medium text-slate-800">
                  {formatDate(request.created_at)}
                </p>
              </div>
            </div>
          </section>

          {/* Decision */}
          {status === 'PENDING' ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Final Step
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Admin Decision
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Approving this request will create the club and make the
                  requester its initial Head. Rejecting it will keep the
                  proposal in the request history as rejected.
                </p>
              </div>

              <div className="mt-6">
                <ClubRequestDecision requestId={request.id} />
              </div>
            </section>
          ) : (
            <section
              className={`rounded-3xl border p-7 shadow-sm ${
                status === 'APPROVED'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  status === 'APPROVED'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                Decision Recorded
              </p>

              <h2
                className={`mt-1 text-xl font-bold ${
                  status === 'APPROVED'
                    ? 'text-emerald-900'
                    : 'text-red-900'
                }`}
              >
                Request {status === 'APPROVED' ? 'Approved' : 'Rejected'}
              </h2>

              <p
                className={`mt-2 text-sm leading-6 ${
                  status === 'APPROVED'
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}
              >
                {status === 'APPROVED'
                  ? 'This request has already been approved. The requester became the initial Head of the club.'
                  : 'This request has already been rejected. The decision is preserved in the request history.'}
              </p>

              {request.reviewed_at && (
                <p
                  className={`mt-4 text-xs ${
                    status === 'APPROVED'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  Decision recorded on {formatDate(request.reviewed_at)}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}