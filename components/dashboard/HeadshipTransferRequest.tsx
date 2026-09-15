'use client'

import { useEffect, useState } from 'react'

type RequestData = {
  id: string
  current_head: {
    name: string
    roll_number: string
  }
  proposed_head: {
    name: string
    roll_number: string
  }
  status: string
  requested_at: string
}

type Props = {
  slug: string
}

export default function HeadshipTransferRequest({ slug }: Props) {
  const [request, setRequest] = useState<RequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadRequest() {
      try {
        const response = await fetch(
          `/api/clubs/${slug}/head-transition/pending`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          setRequest(null)
          return
        }

        const data = await response.json()
        setRequest(data.request ?? null)
      } catch {
        setRequest(null)
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [slug])
async function rejectHeadship() {
  if (!request) return

  const confirmed = window.confirm(
    `Reject the Headship transfer request from ${request.current_head.name}?`
  )

  if (!confirmed) return

  setAccepting(true)
  setMessage('')

  try {
    const response = await fetch(
      `/api/clubs/${slug}/head-transition/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transitionRequestId: request.id,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || 'Unable to reject the request.')
      return
    }

    setRequest(null)
    setMessage('Headship transfer request rejected.')
  } catch {
    setMessage('Something went wrong. Please try again.')
  } finally {
    setAccepting(false)
  }
}
  async function acceptHeadship() {
    if (!request) return

    const confirmed = window.confirm(
      `Accept Headship of this club from ${request.current_head.name}?`
    )

    if (!confirmed) return

    setAccepting(true)
    setMessage('')

    try {
      const response = await fetch(
        `/api/clubs/${slug}/head-transition/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transitionRequestId: request.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Unable to accept the request.')
        return
      }

      setRequest(null)
      setMessage('You are now the Head of this club.')

      window.location.reload()
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setAccepting(false)
    }
  }

  if (loading || !request) {
    return null
  }

  return (
    <section
      style={{
        marginBottom: '40px',
        padding: '24px',
        border: '1px solid #dbe3ef',
        borderRadius: '16px',
        background: '#f8fbff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Headship Transfer
          </p>

          <h2
            style={{
              margin: '8px 0',
              fontSize: '24px',
            }}
          >
            You have been proposed as the new Head
          </h2>

          <p
            style={{
              margin: 0,
              color: '#526070',
              lineHeight: 1.6,
            }}
          >
            <strong>{request.current_head.name}</strong> has proposed you as
            the next Head of this club.
          </p>
        </div>

        <div
  style={{
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  }}
>
  <button
    type="button"
    onClick={acceptHeadship}
    disabled={accepting}
    style={{
      border: 'none',
      borderRadius: '10px',
      padding: '12px 18px',
      fontWeight: 700,
      cursor: accepting ? 'not-allowed' : 'pointer',
      opacity: accepting ? 0.6 : 1,
    }}
  >
    {accepting ? 'Accepting...' : 'Accept Headship'}
  </button>

  <button
    type="button"
    onClick={rejectHeadship}
    disabled={accepting}
    style={{
      border: '1px solid #dbe3ef',
      borderRadius: '10px',
      padding: '12px 18px',
      fontWeight: 700,
      cursor: accepting ? 'not-allowed' : 'pointer',
      opacity: accepting ? 0.6 : 1,
      background: 'white',
    }}
  >
    Reject
  </button>
</div>
      </div>

      {message && (
        <p
          style={{
            marginTop: '16px',
            marginBottom: 0,
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      )}
    </section>
  )
}