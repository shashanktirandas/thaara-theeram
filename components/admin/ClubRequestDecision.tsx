'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  requestId: string
}

export default function ClubRequestDecision({
  requestId,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [error, setError] = useState('')

  const handleDecision = async (
    decision: 'APPROVE' | 'REJECT'
  ) => {
    const message =
      decision === 'APPROVE'
        ? 'Approve this club request? The requester will become the Head.'
        : 'Reject this club request?'

    if (!window.confirm(message)) {
      return
    }

    setError('')
    setLoading(decision)

    try {
      const response = await fetch(
        `/api/admin/requests/${requestId}/decision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decision }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to process request.')
        return
      }

      router.push('/admin/requests')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleDecision('APPROVE')}
          disabled={loading !== null}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === 'APPROVE'
            ? 'Approving...'
            : 'Approve Request'}
        </button>

        <button
          type="button"
          onClick={() => handleDecision('REJECT')}
          disabled={loading !== null}
          className="rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === 'REJECT'
            ? 'Rejecting...'
            : 'Reject Request'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}