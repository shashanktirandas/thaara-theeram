'use client'

import { useState } from 'react'

type Props = {
  onComplete?: () => void
}

export default function AdminInvitation({
  onComplete,
}: Props) {
  const [loading, setLoading] =
    useState<'accept' | 'reject' | null>(null)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  async function handleAction(
    action: 'accept' | 'reject'
  ) {
    if (action === 'reject') {
      const confirmed =
        window.confirm(
          'Are you sure you want to decline the Platform Admin invitation?'
        )

      if (!confirmed) return
    }

    try {
      setLoading(action)
      setError('')
      setMessage('')

      const response = await fetch(
        '/api/admin/administrators/invitation',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            action,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Could not process invitation.'
        )
      }

      setMessage(
        data?.message ||
          'Invitation processed.'
      )

      onComplete?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Platform Invitation
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            You&apos;ve been invited to become a Platform Admin
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            A Platform Admin has invited you to help manage
            Thaara Theeram. Admin access gives you platform-level
            management capabilities while you remain a normal
            student account.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            INVITATION
          </p>

          <p className="mt-1 font-bold text-amber-700">
            Pending
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {!message && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              handleAction('accept')
            }
            disabled={loading !== null}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === 'accept'
              ? 'Accepting...'
              : 'Accept Invitation'}
          </button>

          <button
            type="button"
            onClick={() =>
              handleAction('reject')
            }
            disabled={loading !== null}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === 'reject'
              ? 'Declining...'
              : 'Decline'}
          </button>
        </div>
      )}
    </section>
  )
}