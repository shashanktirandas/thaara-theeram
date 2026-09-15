'use client'

import { useEffect, useState } from 'react'

type Application = {
  id: string
  message: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submitted_at: string
  student:
    | {
        id: string
        name: string
        roll_number: string
        department: string
        year: string
        section: string
        profile_photo_url: string | null
      }
    | {
        id: string
        name: string
        roll_number: string
        department: string
        year: string
        section: string
        profile_photo_url: string | null
      }[]
    | null
}

type Props = {
  slug: string
}

export default function ApplicationsManager({ slug }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadApplications() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/clubs/${slug}/applications`)

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to load applications.')
        return
      }

      setApplications(data.applications ?? [])
    } catch {
      setError('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [slug])

  async function reviewApplication(
    applicationId: string,
    decision: 'APPROVE' | 'REJECT'
  ) {
    setReviewingId(applicationId)
    setError('')

    try {
      const response = await fetch(
        `/api/clubs/${slug}/applications/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            decision,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to review application.')
        return
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: data.status,
              }
            : application
        )
      )
    } catch {
      setError('Unable to connect to the server.')
    } finally {
      setReviewingId(null)
    }
  }

  const pendingApplications = applications.filter(
    (application) => application.status === 'PENDING'
  )

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Applications</h2>
        <p className="mt-3 text-sm text-slate-500">
          Loading applications...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Applications</h2>
        <p className="mt-3 text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={loadApplications}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Applications</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pendingApplications.length} pending application
            {pendingApplications.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {pendingApplications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium">No pending applications.</p>
          <p className="mt-1 text-sm text-slate-500">
            New applications will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {pendingApplications.map((application) => {
            const student = Array.isArray(application.student)
              ? application.student[0]
              : application.student

            if (!student) return null

            const reviewing = reviewingId === application.id

            return (
              <div
                key={application.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {student.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {student.roll_number} · {student.department} ·{' '}
                      {student.year} · Section {student.section}
                    </p>

                    {application.message && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Why they want to join
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {application.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={reviewing}
                      onClick={() =>
                        reviewApplication(
                          application.id,
                          'APPROVE'
                        )
                      }
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {reviewing ? 'Processing...' : 'Approve'}
                    </button>

                    <button
                      type="button"
                      disabled={reviewing}
                      onClick={() =>
                        reviewApplication(
                          application.id,
                          'REJECT'
                        )
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}