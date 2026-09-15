'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  slug: string
  notificationId: string
}

type TransitionRequest = {
  id: string
  current_head_id: string
  proposed_head_id: string
  status: string
  requested_at: string
  current_head?: {
    id: string
    name: string
    roll_number: string
  } | null
  proposed_head?: {
    id: string
    name: string
    roll_number: string
  } | null
}

export default function HeadTransitionActions({
  slug,
  notificationId,
}: Props) {
  const router = useRouter()

  const [request, setRequest] = useState<TransitionRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState('')
  const [resolved, setResolved] = useState(false)

  async function loadRequest() {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/clubs/${slug}/head-transition/pending`,
        {
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.error || 'Unable to load the transfer request.'
        )
        return
      }

      setRequest(data.request ?? null)
    } catch {
      setMessage('Unable to load the transfer request.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequest()
  }, [slug])

  async function handleDecision(
    decision: 'ACCEPT' | 'REJECT'
  ) {
    if (!request || working) return

    const confirmed = window.confirm(
      decision === 'ACCEPT'
        ? 'Accept this Headship transfer? You will become the new Head of this club.'
        : 'Reject this Headship transfer request?'
    )

    if (!confirmed) return

    setWorking(true)
    setMessage('')

    try {
      const endpoint =
        decision === 'ACCEPT'
          ? `/api/clubs/${slug}/head-transition/accept`
          : `/api/clubs/${slug}/head-transition/reject`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transitionRequestId: request.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.error ||
            `Unable to ${
              decision === 'ACCEPT' ? 'accept' : 'reject'
            } the transfer.`
        )
        return
      }

      setResolved(true)

      // Mark the request notification as read.
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'MARK_READ',
          notificationId,
        }),
      })

      router.refresh()
    } catch {
      setMessage(
        `Unable to ${
          decision === 'ACCEPT' ? 'accept' : 'reject'
        } the transfer. Please try again.`
      )
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
        <p className="text-xs font-medium text-yellow-800">
          Loading transfer request...
        </p>
      </div>
    )
  }

  if (resolved) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="text-sm font-semibold text-emerald-800">
          Transfer request processed successfully.
        </p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-500">
          This transfer request is no longer pending.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50/70 p-5">
      <p className="text-sm font-bold text-slate-900">
        Headship Transfer Request
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        <span className="font-semibold text-slate-800">
          {request.current_head?.name || 'The current Head'}
        </span>{' '}
        wants you to become the new Head of this club.
      </p>

      {request.current_head && (
        <div className="mt-3 rounded-xl bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Current Head
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {request.current_head.name}
          </p>

          <p className="text-xs text-slate-500">
            {request.current_head.roll_number}
          </p>
        </div>
      )}

      {message && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {message}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleDecision('ACCEPT')}
          disabled={working}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {working ? 'Processing...' : 'Accept Transfer'}
        </button>

        <button
          type="button"
          onClick={() => handleDecision('REJECT')}
          disabled={working}
          className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  )
}