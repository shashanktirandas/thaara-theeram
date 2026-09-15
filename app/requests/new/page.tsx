'use client'

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const categories = [
  'Technical',
  'Cultural',
  'Arts & Media',
  'Sports',
  'Literary',
  'Social & Service',
  'Entrepreneurship',
  'Academic',
  'Other',
]

type ExistingRequest = {
  id: string
  club_name: string
  category: string | null
  description: string
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

function NewClubRequestContent() {
  const searchParams = useSearchParams()
  const reapplyId =
    searchParams.get('reapply')

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [requests, setRequests] =
    useState<ExistingRequest[]>([])

  const [clubName, setClubName] =
    useState('')

  const [category, setCategory] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [reason, setReason] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const [submitted, setSubmitted] =
    useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    if (!reapplyId || requests.length === 0) {
      return
    }

    const request = requests.find(
      (item) => item.id === reapplyId
    )

    if (!request) return

    setClubName(request.club_name)
    setCategory(request.category || '')
    setDescription(request.description)
    setReason(request.reason || '')
  }, [reapplyId, requests])

  async function loadRequests() {
    try {
      setLoading(true)

      const response = await fetch(
        '/api/club-requests',
        {
          cache: 'no-store',
        }
      )

      if (response.status === 401) {
        window.location.href =
          '/login?returnTo=/requests/new'
        return
      }

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Could not load your club requests.'
        )
      }

      setRequests(
        data.requests || []
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load your requests.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault()

    setError('')
    setMessage('')

    const cleanName =
      clubName.trim()

    const cleanDescription =
      description.trim()

    const cleanReason =
      reason.trim()

    if (!cleanName) {
      setError(
        'Please enter a club name.'
      )
      return
    }

    if (!category) {
      setError(
        'Please select a club category.'
      )
      return
    }

    if (!cleanDescription) {
      setError(
        'Please describe what your club is about.'
      )
      return
    }

    if (cleanDescription.length < 30) {
      setError(
        'Please provide a little more detail about the club.'
      )
      return
    }

    if (!cleanReason) {
      setError(
        'Please explain why this club should be started.'
      )
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(
        '/api/club-requests',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            club_name: cleanName,
            category,
            description:
              cleanDescription,
            reason: cleanReason,
            reapply_id:
              reapplyId || undefined,
          }),
        }
      )

      if (response.status === 401) {
        window.location.href =
          `/login?returnTo=${encodeURIComponent(
            '/requests/new'
          )}`
        return
      }

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Could not submit your club request.'
        )
      }

      setSubmitted(true)

      setMessage(
        data?.message ||
          'Your club request has been submitted.'
      )

      setClubName('')
      setCategory('')
      setDescription('')
      setReason('')

      await loadRequests()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not submit your request.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Start a Club
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Turn an idea into a community.
            </p>
          </div>

          <div className="hidden gap-3 sm:flex">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Intro */}
        <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
                Your idea starts here
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Build something students
                can belong to.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                Have an idea for a new club?
                Tell us what you want to build,
                who it is for, and why it would
                add something meaningful to
                campus life.
              </p>
            </div>

            {/* Process */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  1
                </div>

                <h3 className="mt-4 font-bold">
                  Share the idea
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explain what your club
                  will bring to students.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  2
                </div>

                <h3 className="mt-4 font-bold">
                  Admin review
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The Thaara Theeram team
                  reviews your proposal.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  3
                </div>

                <h3 className="mt-4 font-bold">
                  Create the community
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Once approved, your club
                  gets its own place on Thaara
                  Theeram.
                </p>
              </div>
            </div>
          </div>

          {/* Side note */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
              Before you submit
            </p>

            <h3 className="mt-3 text-xl font-bold">
              Make the idea clear.
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">
                  What?
                </span>{' '}
                What will the club actually
                do?
              </p>

              <p>
                <span className="font-semibold text-slate-900">
                  Why?
                </span>{' '}
                Why should students have
                this community?
              </p>

              <p>
                <span className="font-semibold text-slate-900">
                  Impact?
                </span>{' '}
                What will members learn,
                create, experience, or
                contribute?
              </p>
            </div>
          </aside>
        </section>

        {/* Form */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
              {reapplyId
                ? 'Improve your proposal'
                : 'Club proposal'}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {reapplyId
                ? 'Reapply for your club'
                : 'Tell us about your club'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {reapplyId
                ? 'Your previous request was rejected. Refine the proposal below and submit it again.'
                : 'A strong proposal helps the Admin team understand the purpose and potential of your club.'}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                ✓
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Proposal submitted
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Your club proposal is now
                with the Admin team. You can
                track its status from your
                Dashboard.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  View Dashboard
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setMessage('')
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Submit Another Idea
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-7"
            >
              {/* Club name */}
              <div>
                <label
                  htmlFor="clubName"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Club Name
                </label>

                <input
                  id="clubName"
                  value={clubName}
                  onChange={(event) =>
                    setClubName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Photography Club"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Choose a clear name students
                  can easily understand.
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    What is this club about?
                  </label>

                  <span className="text-xs text-slate-400">
                    {description.length}/1000
                  </span>
                </div>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  maxLength={1000}
                  rows={6}
                  placeholder="Describe the purpose of the club, what members will do, and what kind of community you want to build."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {/* Reason */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Why should this club be started?
                  </label>

                  <span className="text-xs text-slate-400">
                    {reason.length}/1000
                  </span>
                </div>

                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  maxLength={1000}
                  rows={6}
                  placeholder="Tell us what need, opportunity, or student interest this club addresses."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-xs leading-5 text-slate-400">
                  By submitting this proposal,
                  you are asking the Thaara
                  Theeram Admin team to review
                  the idea. Approval does not
                  guarantee immediate events or
                  funding.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Submitting...'
                    : reapplyId
                      ? 'Submit Reapplication'
                      : 'Submit Club Proposal'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Existing requests */}
        <section className="mt-12">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                Your proposals
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Request History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your previous club proposals.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading your requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold text-slate-700">
                No club proposals yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your submitted proposals will
                appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {requests.map(
                (request) => (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {request.club_name}
                          </h3>

                          {request.category && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {request.category}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Submitted{' '}
                          {new Date(
                            request.created_at
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          request.status ===
                          'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : request.status ===
                                'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {request.description}
                    </p>

                    {request.status ===
                      'PENDING' && (
                      <p className="mt-4 text-sm font-medium text-amber-700">
                        Your request is currently
                        under Admin review.
                      </p>
                    )}

                    {request.status ===
                      'APPROVED' && (
                      <p className="mt-4 text-sm font-medium text-emerald-700">
                        Your club has been approved.
                        You are the initial Head.
                      </p>
                    )}

                    {request.status ===
                      'REJECTED' && (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <p className="text-sm text-red-600">
                          This proposal was
                          rejected. You can improve
                          it and apply again.
                        </p>

                        <Link
                          href={`/requests/new?reapply=${request.id}`}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Reapply
                        </Link>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-500">
          © 2026 Thaara Theeram
        </div>
      </footer>
    </main>
  )
}

export default function NewClubRequestPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
            <p className="text-sm text-slate-500">
              Loading...
            </p>
          </div>
        </main>
      }
    >
      <NewClubRequestContent />
    </Suspense>
  )
}