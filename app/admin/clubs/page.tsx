'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type ClubStatus = 'ACTIVE' | 'ARCHIVED'

type Club = {
  id: string
  name: string
  slug: string
  category: string | null
  short_description: string | null
  status: ClubStatus
  created_at: string
}

type TrashClub = {
  id: string
  name: string
  slug: string
  category: string | null
  status: 'TRASHED'
  status_before_trash: 'ACTIVE' | 'ARCHIVED' | null
  deleted_at: string | null
  deleted_by: string | null
  restore_available_until: string | null
  remaining_days: number
  recovery_expired: boolean
}

type DeleteModalState = {
  club: Club
} | null

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [trashClubs, setTrashClubs] = useState<TrashClub[]>([])

  const [loading, setLoading] = useState(true)
  const [trashLoading, setTrashLoading] = useState(true)

  const [actionId, setActionId] = useState<string | null>(null)
  const [trashActionId, setTrashActionId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [trashError, setTrashError] = useState('')

  const [showTrash, setShowTrash] = useState(false)
  const [deleteModal, setDeleteModal] =
    useState<DeleteModalState>(null)

  const [confirmationName, setConfirmationName] =
    useState('')

  const [deleteError, setDeleteError] = useState('')

  const [deleteWorking, setDeleteWorking] =
    useState(false)
      const [cleanupWorking, setCleanupWorking] = useState(false)
  const [cleanupMessage, setCleanupMessage] = useState('')

  async function loadClubs() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/clubs')

      if (!response.ok) {
        throw new Error('Failed to load clubs.')
      }

      const data = await response.json()

      setClubs(data.clubs ?? [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadTrash() {
    try {
      setTrashLoading(true)
      setTrashError('')

      const response = await fetch(
        '/api/admin/clubs/trash'
      )

      if (!response.ok) {
        const data = await response.json().catch(
          () => null
        )

        throw new Error(
          data?.error ||
            'Failed to load Trash.'
        )
      }

      const data = await response.json()

      setTrashClubs(data.clubs ?? [])
    } catch (err) {
      setTrashError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setTrashLoading(false)
    }
  }

  useEffect(() => {
    loadClubs()
    loadTrash()
  }, [])

  async function changeStatus(
    club: Club,
    status: ClubStatus
  ) {
    const action =
      status === 'ARCHIVED'
        ? 'archive'
        : 'restore'

    const confirmed = window.confirm(
      status === 'ARCHIVED'
        ? `Archive ${club.name}? The club and its history will be preserved.`
        : `Restore ${club.name}?`
    )

    if (!confirmed) return

    try {
      setActionId(club.id)
      setError('')

      const response = await fetch(
        `/api/admin/clubs/${club.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${action} club.`
        )
      }

      setClubs((currentClubs) =>
        currentClubs.map((item) =>
          item.id === club.id
            ? {
                ...item,
                status,
              }
            : item
        )
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setActionId(null)
    }
  }

  function openDeleteModal(club: Club) {
    setDeleteModal({ club })
    setConfirmationName('')
    setDeleteError('')
  }

  function closeDeleteModal() {
    if (deleteWorking) return

    setDeleteModal(null)
    setConfirmationName('')
    setDeleteError('')
  }

  async function trashClub() {
    if (!deleteModal) return

    const club = deleteModal.club

    if (confirmationName !== club.name) {
      setDeleteError(
        'The club name must match exactly.'
      )
      return
    }

    try {
      setDeleteWorking(true)
      setDeleteError('')
      setError('')

      const response = await fetch(
        `/api/admin/clubs/${club.id}/trash`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'TRASH',
            clubNameConfirmation:
              confirmationName,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to move the club to Trash.'
        )
      }

      setClubs((currentClubs) =>
        currentClubs.filter(
          (item) => item.id !== club.id
        )
      )

      setDeleteModal(null)
      setConfirmationName('')

      await loadTrash()
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setDeleteWorking(false)
    }
  }

  async function restoreFromTrash(
    club: TrashClub
  ) {
    if (club.recovery_expired) {
      setTrashError(
        'The 7-day recovery period has expired.'
      )
      return
    }

    const confirmed = window.confirm(
      `Restore ${club.name}?\n\nIt will return to ${club.status_before_trash ?? 'ACTIVE'} status.`
    )

    if (!confirmed) return

    try {
      setTrashActionId(club.id)
      setTrashError('')

      const response = await fetch(
        `/api/admin/clubs/${club.id}/trash`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'RESTORE',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to restore the club.'
        )
      }

      await Promise.all([
        loadClubs(),
        loadTrash(),
      ])
    } catch (err) {
      setTrashError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setTrashActionId(null)
    }
  }
  async function permanentlyDeleteExpiredClubs() {
    const expiredClubs = trashClubs.filter(
      (club) => club.recovery_expired
    )

    if (expiredClubs.length === 0) {
      setCleanupMessage(
        'There are no clubs eligible for permanent deletion yet.'
      )
      return
    }

    const confirmed = window.confirm(
      `Permanently delete ${expiredClubs.length} expired ${
        expiredClubs.length === 1 ? 'club' : 'clubs'
      }?\n\n` +
        'This action cannot be undone. All historical club records ' +
        '(memberships, applications, announcements and head-transition history) ' +
        'for these clubs will also be permanently deleted.'
    )

    if (!confirmed) return

    try {
      setCleanupWorking(true)
      setCleanupMessage('')
      setTrashError('')

      const response = await fetch(
        '/api/admin/clubs/trash/cleanup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to permanently delete expired clubs.'
        )
      }

      const deletedCount = Number(
        data?.deletedCount ?? 0
      )

      setCleanupMessage(
        deletedCount > 0
          ? `${deletedCount} ${
              deletedCount === 1 ? 'club' : 'clubs'
            } permanently deleted.`
          : 'No expired clubs were deleted.'
      )

      await Promise.all([
        loadClubs(),
        loadTrash(),
      ])
    } catch (err) {
      setTrashError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setCleanupWorking(false)
    }
  }
  function formatDate(value: string | null) {
    if (!value) return 'Unknown'

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Back */}
        <Link
          href="/admin"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Thaara Theeram
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Clubs
              </h1>

              <p className="mt-2 text-slate-600">
                View and manage all clubs on Thaara Theeram.
              </p>
            </div>

            {/* Trash toggle */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {showTrash && trashClubs.some(
                (club) => club.recovery_expired
              ) && (
                <button
                  type="button"
                  disabled={cleanupWorking}
                  onClick={permanentlyDeleteExpiredClubs}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cleanupWorking
                    ? 'Permanently Deleting...'
                    : `Permanently Delete Expired`}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowTrash((value) => !value)

                  if (!showTrash) {
                    loadTrash()
                  }
                }}
                className={`inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showTrash
                    ? 'border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {showTrash
                  ? '← Back to Clubs'
                  : `Trash${trashClubs.length ? ` (${trashClubs.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* TRASH VIEW                                            */}
        {/* ===================================================== */}

        {showTrash ? (
          <section>
            <div className="mb-8 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                    Recovery Area
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Trash
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Deleted clubs are hidden from students
                    and remain here for 7 days. Restore a
                    club before the recovery period expires.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                  {trashClubs.length}{' '}
                  {trashClubs.length === 1
                    ? 'club'
                    : 'clubs'}
                </span>
              </div>
            </div>

            {trashError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {trashError}
              </div>
            )}
                        {cleanupMessage && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                {cleanupMessage}
              </div>
            )}
            {trashLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  Loading Trash...
                </p>
              </div>
            ) : trashClubs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  ✓
                </div>

                <h2 className="mt-5 text-lg font-semibold text-slate-800">
                  Trash is empty
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Deleted clubs will appear here for
                  their 7-day recovery period.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {trashClubs.map((club) => {
                  const isWorking =
                    trashActionId === club.id

                  return (
                    <article
                      key={club.id}
                      className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm"
                    >
                      <div className="p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">
                              {club.name}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              /clubs/{club.slug}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            TRASHED
                          </span>
                        </div>

                        {club.category && (
                          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
                            {club.category}
                          </p>
                        )}

                        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">
                              Previous status
                            </span>

                            <span className="font-semibold text-slate-800">
                              {club.status_before_trash ??
                                'Unknown'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">
                              Deleted
                            </span>

                            <span className="text-right font-medium text-slate-700">
                              {formatDate(
                                club.deleted_at
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5">
                          {club.recovery_expired ? (
                            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
                              Recovery period expired
                            </div>
                          ) : (
                            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                Recovery available
                              </p>

                              <p className="mt-1 text-sm font-bold text-amber-900">
                                {club.remaining_days}{' '}
                                {club.remaining_days === 1
                                  ? 'day'
                                  : 'days'}{' '}
                                remaining
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                          <button
                            type="button"
                            disabled={
                              isWorking ||
                              club.recovery_expired
                            }
                            onClick={() =>
                              restoreFromTrash(club)
                            }
                            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isWorking
                              ? 'Restoring...'
                              : 'Restore Club'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Count */}
            {!loading && (
              <p className="mb-5 text-sm text-slate-500">
                {clubs.length}{' '}
                {clubs.length === 1
                  ? 'club'
                  : 'clubs'}
              </p>
            )}

            {/* Loading */}
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  Loading clubs...
                </p>
              </div>
            ) : clubs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h2 className="text-lg font-semibold text-slate-800">
                  No clubs yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  There are currently no clubs on Thaara Theeram.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {clubs.map((club) => {
                  const isArchived =
                    club.status === 'ARCHIVED'

                  const isWorking =
                    actionId === club.id

                  return (
                    <article
                      key={club.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="p-7">

                        {/* Top */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">
                              {club.name}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              /clubs/{club.slug}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              isArchived
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {club.status}
                          </span>
                        </div>

                        {/* Category */}
                        {club.category && (
                          <p className="mt-7 text-sm font-semibold uppercase tracking-wide text-blue-600">
                            {club.category}
                          </p>
                        )}

                        {/* Description */}
                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                          {club.short_description ||
                            'No short description available.'}
                        </p>

                        {/* Divider */}
                        <div className="my-6 border-t border-slate-100" />

                        {/* Created */}
                        <p className="text-xs text-slate-400">
                          Created{' '}
                          {new Intl.DateTimeFormat(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'numeric',
                              year: 'numeric',
                            }
                          ).format(
                            new Date(club.created_at)
                          )}
                        </p>

                        {/* Actions */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">

                          <Link
                            href={`/clubs/${club.slug}`}
                            target="_blank"
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            View Club →
                          </Link>

                          {isArchived ? (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() =>
                                changeStatus(
                                  club,
                                  'ACTIVE'
                                )
                              }
                              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isWorking
                                ? 'Restoring...'
                                : 'Restore'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() =>
                                changeStatus(
                                  club,
                                  'ARCHIVED'
                                )
                              }
                              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isWorking
                                ? 'Archiving...'
                                : 'Archive'}
                            </button>
                          )}

                          <Link
                            href={`/clubs/${club.slug}/manage`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                          >
                            Manage Club →
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(club)
                            }
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================= */}
      {/* DELETE CONFIRMATION MODAL                               */}
      {/* ======================================================= */}

      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-club-title"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="p-7 sm:p-8">

              {/* Warning icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                !
              </div>

              <h2
                id="delete-club-title"
                className="mt-5 text-2xl font-bold tracking-tight text-slate-900"
              >
                Delete {deleteModal.club.name}?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                This will move the club to Trash and hide
                it from students. The club can be restored
                for <strong>7 days</strong>.
              </p>

              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  This is a destructive action.
                </p>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  To continue, type the club name exactly
                  as shown below.
                </p>

                <p className="mt-3 rounded-xl bg-white px-4 py-3 font-mono text-sm font-bold text-slate-900">
                  {deleteModal.club.name}
                </p>
              </div>

              <label
                htmlFor="club-name-confirmation"
                className="mt-6 block text-sm font-semibold text-slate-800"
              >
                Club name
              </label>

              <input
                id="club-name-confirmation"
                type="text"
                value={confirmationName}
                onChange={(event) => {
                  setConfirmationName(
                    event.target.value
                  )
                  setDeleteError('')
                }}
                autoComplete="off"
                autoFocus
                disabled={deleteWorking}
                placeholder={deleteModal.club.name}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:bg-slate-50"
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !deleteWorking
                  ) {
                    trashClub()
                  }

                  if (event.key === 'Escape') {
                    closeDeleteModal()
                  }
                }}
              />

              {deleteError && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {deleteError}
                </p>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleteWorking}
                  onClick={closeDeleteModal}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    deleteWorking ||
                    confirmationName !==
                      deleteModal.club.name
                  }
                  onClick={trashClub}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleteWorking
                    ? 'Moving to Trash...'
                    : 'Delete Club'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}