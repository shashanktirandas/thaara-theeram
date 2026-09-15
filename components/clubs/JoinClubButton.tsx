'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  slug: string
  initialStatus?: 'JOIN' | 'PENDING' | 'MEMBER' | 'HEAD' | 'COORDINATOR'
}

export default function JoinClubButton({
  slug,
  initialStatus = 'JOIN',
}: Props) {
  const router = useRouter()

  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Keep the client-side button state synchronized with
  // the latest server-rendered membership status.
  useEffect(() => {
    setStatus(initialStatus)
    setShowForm(false)
  }, [initialStatus])

  async function handleJoin() {
    if (loading) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/clubs/${slug}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      })

      const data = await response.json()

      if (response.status === 401 && data.error === 'AUTH_REQUIRED') {
        router.push(`/login?returnTo=/clubs/${slug}`)
        return
      }

      if (!response.ok) {
        setMessage(data.error || 'Something went wrong.')
        return
      }

      if (data.status === 'PENDING') {
        setStatus('PENDING')
        setShowForm(false)
        setMessage('Your application has been submitted.')
      } else if (data.status === 'ALREADY_MEMBER') {
        setStatus(data.role || 'MEMBER')
        setShowForm(false)
      }
    } catch {
      setMessage('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'HEAD') {
    return (
      <button
        type="button"
        disabled
        className="rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white"
      >
        You&apos;re the Head
      </button>
    )
  }

  if (status === 'COORDINATOR') {
    return (
      <button
        type="button"
        disabled
        className="rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white"
      >
        You&apos;re a Coordinator
      </button>
    )
  }

  if (status === 'MEMBER') {
    return (
      <button
        type="button"
        disabled
        className="rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white"
      >
        ✓ You&apos;re a Member
      </button>
    )
  }

  if (status === 'PENDING') {
    return (
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          disabled
          className="rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white"
        >
          Application Pending
        </button>

        {message && (
          <p className="text-sm text-white/80">
            {message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Join Club
        </button>
      ) : (
        <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
          <label
            htmlFor="join-message"
            className="mb-2 block text-sm font-semibold text-slate-900"
          >
            Why do you want to join?
          </label>

          <textarea
            id="join-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell the club briefly why you're interested..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleJoin}
              disabled={loading}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setMessage('')
              }}
              disabled={loading}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && !showForm && (
        <p className="text-sm text-white/80">
          {message}
        </p>
      )}
    </div>
  )
}