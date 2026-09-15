'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'
import HeadTransitionActions from '@/components/clubs/HeadTransitionActions'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  club_id?: string | null
  club?: {
    name: string
    slug: string
  } | null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function notificationIcon(type: string) {
  if (type.includes('APPROVED')) return '✓'
  if (type.includes('REJECTED')) return '!'
  if (type.includes('INVITATION')) return '★'
  if (type.includes('HEAD')) return '↗'

  return '•'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications', {
        cache: 'no-store',
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()

      setNotifications(data.notifications ?? [])
    } catch (error) {
      console.error('Notification loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  async function markAsRead(id: string) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'MARK_READ',
          notificationId: id,
        }),
      })

      if (!response.ok) {
        return
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Mark notification read error:', error)
    }
  }

  async function markAllAsRead() {
    if (!notifications.some((notification) => !notification.read)) {
      return
    }

    setMarkingAll(true)

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'MARK_ALL_READ',
        }),
      })

      if (!response.ok) {
        return
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      )
    } catch (error) {
      console.error('Mark all notifications read error:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight"
          >
            Thaara Theeram
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Explore Clubs
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Updates & activity
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Stay updated on your clubs, applications,
              responsibilities, and important Thaara Theeram activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                ✓
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                You're all caught up
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Notifications about club activity and your responsibilities
                will appear here.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore Clubs
              </Link>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const clubHref = notification.club?.slug
                  ? `/clubs/${notification.club.slug}`
                  : null

                return (
                  <article
                    key={notification.id}
                    className={`border-b border-slate-100 px-6 py-5 transition last:border-b-0 ${
                      !notification.read
                        ? 'bg-blue-50/30'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-4">
                      <button
                        type="button"
                        aria-label={
                          notification.read
                            ? 'Notification'
                            : 'Mark notification as read'
                        }
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id)
                          }
                        }}
                        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold transition hover:scale-105"
                      >
                        <span
                          className={`flex h-full w-full items-center justify-center rounded-full ${
                            !notification.read
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {notificationIcon(notification.type)}
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2
                              className={`text-sm ${
                                !notification.read
                                  ? 'font-bold text-slate-900'
                                  : 'font-semibold text-slate-700'
                              }`}
                            >
                              {notification.title}
                            </h2>

                            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                              {notification.type
                                .replaceAll('_', ' ')
                                .toLowerCase()}
                            </p>
                          </div>

                          {!notification.read && (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>

                          {notification.club && clubHref && (
                            <div className="mt-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                  {notification.club.name}
                                </span>

                                <Link
                                  href={clubHref}
                                  onClick={() => {
                                    if (!notification.read) {
                                      markAsRead(notification.id)
                                    }
                                  }}
                                  className="inline-flex items-center rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                  View Club →
                                </Link>
                              </div>

                              {notification.type === 'HEAD_TRANSITION_REQUEST' && (
                                <HeadTransitionActions
                                  slug={notification.club.slug}
                                  notificationId={notification.id}
                                />
                              )}
                            </div>
                          )}

                        <p className="mt-3 text-xs text-slate-400">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-slate-500">
          © 2026 Thaara Theeram
        </div>
      </footer>
    </main>
  )
}