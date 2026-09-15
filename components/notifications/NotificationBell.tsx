'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function notificationIcon(type: string) {
  if (type.includes('APPROVED')) return '✓'
  if (type.includes('REJECTED')) return '!'
  if (type.includes('INVITATION')) return '★'
  if (type.includes('HEAD')) return '↗'

  return '•'
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)

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
      setUnreadCount(data.unreadCount ?? 0)
    } catch (error) {
      console.error('Notification loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  loadNotifications()

  const interval = setInterval(() => {
    loadNotifications()
  }, 30000)

  const handleFocus = () => {
    loadNotifications()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      loadNotifications()
    }
  }

  window.addEventListener('focus', handleFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    clearInterval(interval)
    window.removeEventListener('focus', handleFocus)
    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange
    )
  }
}, [])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [open])

  async function markAsRead(id: string) {
  const notification = notifications.find(
    (item) => item.id === id
  )

  if (!notification || notification.read) {
    return
  }

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
      current.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    )

    setUnreadCount((current) =>
      Math.max(0, current - 1)
    )
  } catch (error) {
    console.error('Mark notification read error:', error)
  }
}

  const previewNotifications = notifications.slice(0, 5)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17H9m9-2V10a6 6 0 10-12 0v5l-2 2h16l-2-2z"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Notifications
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500">
                  Loading notifications...
                </p>
              </div>
            ) : previewNotifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                  ✓
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  No notifications yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Important updates about your clubs and responsibilities
                  will appear here.
                </p>
              </div>
            ) : (
              previewNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                  }}
                  className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                    !notification.read ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      !notification.read
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {notificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-sm ${
                          !notification.read
                            ? 'font-semibold text-slate-900'
                            : 'font-medium text-slate-700'
                        }`}
                      >
                        {notification.title}
                      </p>

                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                See all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}