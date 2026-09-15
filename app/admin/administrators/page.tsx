'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type AdminRole = {
  id: string
  student_id: string
  status: 'PENDING' | 'ACTIVE' | 'REVOKED'
  granted_at: string | null
  accepted_at: string | null
  revoked_at: string | null
  created_at: string
}

type Student = {
  id: string
  name: string
  roll_number: string
  college_email: string
  department: string
  year: string
  section: string
}

type AdminRecord = AdminRole & {
  student: Student | null
}

function formatDate(value: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [rollNumber, setRollNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadAdministrators() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        '/api/admin/administrators',
        {
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Could not load administrators.'
        )
      }

      setAdmins(data.admins || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load administrators.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdministrators()
  }, [])

  async function inviteAdministrator(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!rollNumber.trim()) {
      setError('Enter a student roll number.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch(
        '/api/admin/administrators',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'invite',
            roll_number: rollNumber.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Could not create invitation.'
        )
      }

      setMessage(
        data?.message ||
          'Administrator invitation created.'
      )

      setRollNumber('')

      await loadAdministrators()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create invitation.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function revokeAdministrator(
    adminRoleId: string
  ) {
    const confirmed = window.confirm(
      'Are you sure you want to revoke this administrator access?'
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      const response = await fetch(
        '/api/admin/administrators',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'revoke',
            admin_role_id: adminRoleId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Could not revoke administrator access.'
        )
      }

      setMessage(
        data?.message ||
          'Administrator access revoked.'
      )

      await loadAdministrators()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not revoke administrator access.'
      )
    }
  }

  const activeAdmins = admins.filter(
    (admin) => admin.status === 'ACTIVE'
  )

  const pendingAdmins = admins.filter(
    (admin) => admin.status === 'PENDING'
  )

  const revokedAdmins = admins.filter(
    (admin) => admin.status === 'REVOKED'
  )

  const canRevoke = activeAdmins.length > 1

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Admin
            </Link>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Administrators
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage Platform Admin access for Thaara Theeram.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Alerts */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Active Administrators
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeAdmins.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Pending Invitations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingAdmins.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Revoked / Historical
            </p>

            <p className="mt-2 text-3xl font-bold">
              {revokedAdmins.length}
            </p>
          </div>
        </section>

        {/* Invite */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
            Add administrator
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Invite a student as Platform Admin
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Enter the student&apos;s roll number. The student must
            already have an activated Thaara Theeram account and
            will need to accept the invitation.
          </p>

          <form
            onSubmit={inviteAdministrator}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="roll_number"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Student Roll Number
              </label>

              <input
                id="roll_number"
                value={rollNumber}
                onChange={(event) =>
                  setRollNumber(event.target.value)
                }
                placeholder="Enter roll number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Sending...'
                : 'Invite Administrator'}
            </button>
          </form>
        </section>

        {/* Active */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">
            Active Administrators
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Students who currently have Platform Admin access.
          </p>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
                Loading administrators...
              </div>
            ) : activeAdmins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No active administrators found.
              </div>
            ) : (
              activeAdmins.map((admin) => {
                const student = admin.student

                if (!student) return null

                return (
                  <div
                    key={admin.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {student.name
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">
                              {student.name}
                            </h3>

                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              ACTIVE ADMIN
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-600">
                            {student.roll_number} ·{' '}
                            {student.department} ·{' '}
                            {student.year} · Section{' '}
                            {student.section}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {student.college_email}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            Granted:{' '}
                            {formatDate(admin.granted_at)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          revokeAdministrator(admin.id)
                        }
                        disabled={!canRevoke}
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${
                          canRevoke
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                        }`}
                      >
                        Revoke Access
                      </button>
                    </div>

                    {!canRevoke && (
                      <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                        The last active Platform Admin cannot be
                        removed.
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Pending */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">
            Pending Invitations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Administrator invitations waiting for acceptance.
          </p>

          <div className="mt-4 space-y-3">
            {pendingAdmins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No pending administrator invitations.
              </div>
            ) : (
              pendingAdmins.map((admin) => {
                const student = admin.student

                if (!student) return null

                return (
                  <div
                    key={admin.id}
                    className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">
                          {student.name}
                        </h3>

                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                          PENDING
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {student.roll_number} ·{' '}
                        {student.department} · {student.year}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {student.college_email}
                      </p>
                    </div>

                    <div className="text-sm text-slate-500 sm:text-right">
                      <p className="font-semibold text-slate-700">
                        Waiting for acceptance
                      </p>

                      <p className="mt-1 text-xs">
                        Invited:{' '}
                        {formatDate(admin.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* History */}
        {revokedAdmins.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold">
              Administrator History
            </h2>

            <div className="mt-4 space-y-3">
              {revokedAdmins.map((admin) => {
                const student = admin.student

                if (!student) return null

                return (
                  <div
                    key={admin.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {student.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {student.roll_number} ·{' '}
                          {student.department} · {student.year}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          REVOKED
                        </span>

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(admin.revoked_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>

          <Link
            href="/admin/students"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Student Directory
          </Link>

          <Link
            href="/admin/clubs"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Club Management
          </Link>
        </div>
      </div>
    </main>
  )
}