'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  slug: string
}

export default function LeaveClubButton({ slug }: Props) {
  const router = useRouter()

  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLeave() {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/clubs/${slug}/leave`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to leave the club.')
        return
      }

      setShowConfirm(false)

      // Refresh the server-rendered club page so the
      // membership state changes immediately.
      router.refresh()
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => {
            setError('')
            setShowConfirm(true)
          }}
          className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Leave Club
        </button>
      ) : (
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
          <p className="text-base font-bold text-slate-900">
            Leave this club?
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            You will no longer be an active member of this club.
            You can apply to join again later.
          </p>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLeave}
              disabled={loading}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Leaving...' : 'Leave Club'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!loading) {
                  setShowConfirm(false)
                  setError('')
                }
              }}
              disabled={loading}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}