// 'use client'

// import Link from 'next/link'
// import { useEffect, useRef, useState } from 'react'

// type Notification = {
//   id: string
//   type: string
//   title: string
//   message: string
//   read: boolean
//   created_at: string
// }

// function formatTime(dateString: string) {
//   const date = new Date(dateString)
//   const now = new Date()
//   const diff = now.getTime() - date.getTime()

//   const minutes = Math.floor(diff / 60000)
//   const hours = Math.floor(diff / 3600000)
//   const days = Math.floor(diff / 86400000)

//   if (minutes < 1) return 'Just now'
//   if (minutes < 60) return `${minutes}m ago`
//   if (hours < 24) return `${hours}h ago`
//   if (days < 7) return `${days}d ago`

//   return date.toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   })
// }

// function notificationIcon(type: string) {
//   if (type.includes('APPROVED')) return '✓'
//   if (type.includes('REJECTED')) return '!'
//   if (type.includes('INVITATION')) return '★'
//   if (type.includes('HEAD')) return '↗'

//   return '•'
// }

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [unreadCount, setUnreadCount] = useState(0)
//   const [open, setOpen] = useState(false)
//   const [loading, setLoading] = useState(true)

//   const containerRef = useRef<HTMLDivElement>(null)

//   async function loadNotifications() {
//     try {
//       const response = await fetch('/api/notifications', {
//         cache: 'no-store',
//       })

//       if (!response.ok) {
//         return
//       }

//       const data = await response.json()

//       setNotifications(data.notifications ?? [])
//       setUnreadCount(data.unreadCount ?? 0)
//     } catch (error) {
//       console.error('Notification loading error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//   loadNotifications()

//   const interval = setInterval(() => {
//     loadNotifications()
//   }, 30000)

//   const handleFocus = () => {
//     loadNotifications()
//   }

//   const handleVisibilityChange = () => {
//     if (document.visibilityState === 'visible') {
//       loadNotifications()
//     }
//   }

//   window.addEventListener('focus', handleFocus)
//   document.addEventListener('visibilitychange', handleVisibilityChange)

//   return () => {
//     clearInterval(interval)
//     window.removeEventListener('focus', handleFocus)
//     document.removeEventListener(
//       'visibilitychange',
//       handleVisibilityChange
//     )
//   }
// }, [])

//   useEffect(() => {
//     function handleOutsideClick(event: MouseEvent) {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setOpen(false)
//       }
//     }

//     if (open) {
//       document.addEventListener('mousedown', handleOutsideClick)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleOutsideClick)
//     }
//   }, [open])

//   async function markAsRead(id: string) {
//   const notification = notifications.find(
//     (item) => item.id === id
//   )

//   if (!notification || notification.read) {
//     return
//   }

//   try {
//     const response = await fetch('/api/notifications', {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         action: 'MARK_READ',
//         notificationId: id,
//       }),
//     })

//     if (!response.ok) {
//       return
//     }

//     setNotifications((current) =>
//       current.map((item) =>
//         item.id === id
//           ? { ...item, read: true }
//           : item
//       )
//     )

//     setUnreadCount((current) =>
//       Math.max(0, current - 1)
//     )
//   } catch (error) {
//     console.error('Mark notification read error:', error)
//   }
// }

//   const previewNotifications = notifications.slice(0, 5)

//   return (
//     <div ref={containerRef} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((current) => !current)}
//         aria-label="Notifications"
//         aria-expanded={open}
//         className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
//       >
//         <svg
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.8"
//           className="h-5 w-5"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M15 17H9m9-2V10a6 6 0 10-12 0v5l-2 2h16l-2-2z"
//           />
//         </svg>

//         {unreadCount > 0 && (
//           <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
//             {unreadCount > 99 ? '99+' : unreadCount}
//           </span>
//         )}
//       </button>

//       {open && (
//         <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
//           <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
//             <div>
//               <p className="text-sm font-semibold text-slate-900">
//                 Notifications
//               </p>

//               <p className="mt-0.5 text-xs text-slate-500">
//                 {unreadCount > 0
//                   ? `${unreadCount} unread`
//                   : "You're all caught up"}
//               </p>
//             </div>

//             <Link
//               href="/notifications"
//               onClick={() => setOpen(false)}
//               className="text-xs font-semibold text-blue-600 hover:text-blue-700"
//             >
//               View all
//             </Link>
//           </div>

//           <div className="max-h-[420px] overflow-y-auto">
//             {loading ? (
//               <div className="px-5 py-10 text-center">
//                 <p className="text-sm text-slate-500">
//                   Loading notifications...
//                 </p>
//               </div>
//             ) : previewNotifications.length === 0 ? (
//               <div className="px-5 py-10 text-center">
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
//                   ✓
//                 </div>

//                 <p className="mt-3 text-sm font-semibold text-slate-800">
//                   No notifications yet
//                 </p>

//                 <p className="mt-1 text-xs leading-5 text-slate-500">
//                   Important updates about your clubs and responsibilities
//                   will appear here.
//                 </p>
//               </div>
//             ) : (
//               previewNotifications.map((notification) => (
//                 <button
//                   key={notification.id}
//                   type="button"
//                   onClick={() => {
//                     if (!notification.read) {
//                       markAsRead(notification.id)
//                     }
//                   }}
//                   className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
//                     !notification.read ? 'bg-blue-50/40' : 'bg-white'
//                   }`}
//                 >
//                   <div
//                     className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
//                       !notification.read
//                         ? 'bg-blue-100 text-blue-700'
//                         : 'bg-slate-100 text-slate-500'
//                     }`}
//                   >
//                     {notificationIcon(notification.type)}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-start justify-between gap-3">
//                       <p
//                         className={`text-sm ${
//                           !notification.read
//                             ? 'font-semibold text-slate-900'
//                             : 'font-medium text-slate-700'
//                         }`}
//                       >
//                         {notification.title}
//                       </p>

//                       {!notification.read && (
//                         <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
//                       )}
//                     </div>

//                     <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
//                       {notification.message}
//                     </p>

//                     <p className="mt-2 text-[11px] text-slate-400">
//                       {formatTime(notification.created_at)}
//                     </p>
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>

//           {notifications.length > 5 && (
//             <div className="border-t border-slate-100 px-5 py-3">
//               <Link
//                 href="/notifications"
//                 onClick={() => setOpen(false)}
//                 className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
//               >
//                 See all notifications →
//               </Link>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }


// 'use client'

// import Link from 'next/link'
// import { useEffect, useRef, useState } from 'react'

// type Notification = {
//   id: string
//   type: string
//   title: string
//   message: string
//   read: boolean
//   created_at: string
// }

// function formatTime(dateString: string) {
//   const date = new Date(dateString)
//   const now = new Date()
//   const diff = now.getTime() - date.getTime()

//   const minutes = Math.floor(diff / 60000)
//   const hours = Math.floor(diff / 3600000)
//   const days = Math.floor(diff / 86400000)

//   if (minutes < 1) return 'Just now'
//   if (minutes < 60) return `${minutes}m ago`
//   if (hours < 24) return `${hours}h ago`
//   if (days < 7) return `${days}d ago`

//   return date.toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   })
// }

// function NotificationTypeIcon({
//   type,
//   read,
// }: {
//   type: string
//   read: boolean
// }) {
//   const iconClass = read ? 'text-slate-500' : 'text-[#0B3B82]'

//   if (type.includes('APPROVED')) {
//     return (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         className={`h-5 w-5 ${iconClass}`}
//         aria-hidden="true"
//       >
//         <path
//           d="m6 12 4 4 8-8"
//           stroke="currentColor"
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//     )
//   }

//   if (type.includes('REJECTED')) {
//     return (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         className={`h-5 w-5 ${read ? 'text-slate-500' : 'text-red-600'}`}
//         aria-hidden="true"
//       >
//         <circle
//           cx="12"
//           cy="12"
//           r="8.5"
//           stroke="currentColor"
//           strokeWidth="1.7"
//         />
//         <path
//           d="M9 9l6 6M15 9l-6 6"
//           stroke="currentColor"
//           strokeWidth="1.7"
//           strokeLinecap="round"
//         />
//       </svg>
//     )
//   }

//   if (type.includes('INVITATION')) {
//     return (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         className={`h-5 w-5 ${
//           read ? 'text-slate-500' : 'text-[#8A6500]'
//         }`}
//         aria-hidden="true"
//       >
//         <path
//           d="m12 3 1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3Z"
//           stroke="currentColor"
//           strokeWidth="1.6"
//           strokeLinejoin="round"
//         />
//       </svg>
//     )
//   }

//   if (type.includes('HEAD') || type.includes('ROLE')) {
//     return (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         className={`h-5 w-5 ${iconClass}`}
//         aria-hidden="true"
//       >
//         <circle
//           cx="12"
//           cy="8"
//           r="3.2"
//           stroke="currentColor"
//           strokeWidth="1.6"
//         />
//         <path
//           d="M5 20a7 7 0 0 1 14 0"
//           stroke="currentColor"
//           strokeWidth="1.6"
//           strokeLinecap="round"
//         />
//         <path
//           d="M18 5v4M16 7h4"
//           stroke="currentColor"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//         />
//       </svg>
//     )
//   }

//   if (
//     type.includes('MEMBER') ||
//     type.includes('CLUB') ||
//     type.includes('JOIN')
//   ) {
//     return (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         className={`h-5 w-5 ${iconClass}`}
//         aria-hidden="true"
//       >
//         <circle
//           cx="9"
//           cy="8"
//           r="3"
//           stroke="currentColor"
//           strokeWidth="1.7"
//         />
//         <path
//           d="M3.5 19a5.5 5.5 0 0 1 11 0"
//           stroke="currentColor"
//           strokeWidth="1.7"
//           strokeLinecap="round"
//         />
//         <path
//           d="M17 8v6M14 11h6"
//           stroke="currentColor"
//           strokeWidth="1.6"
//           strokeLinecap="round"
//         />
//       </svg>
//     )
//   }

//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className={`h-5 w-5 ${iconClass}`}
//       aria-hidden="true"
//     >
//       <path
//         d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
//         stroke="currentColor"
//         strokeWidth="1.6"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M10 21h4"
//         stroke="currentColor"
//         strokeWidth="1.6"
//         strokeLinecap="round"
//       />
//     </svg>
//   )
// }

// function BellIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-[19px] w-[19px]"
//       aria-hidden="true"
//     >
//       <path
//         d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M10 21h4"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinecap="round"
//       />
//     </svg>
//   )
// }

// function ArrowIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-4 w-4"
//       aria-hidden="true"
//     >
//       <path
//         d="M5 12h13M13 6l6 6-6 6"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   )
// }

// function ChevronIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-4 w-4"
//       aria-hidden="true"
//     >
//       <path
//         d="m9 18 6-6-6-6"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   )
// }

// function SparkIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-5 w-5"
//       aria-hidden="true"
//     >
//       <path
//         d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinejoin="round"
//       />
//     </svg>
//   )
// }

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [unreadCount, setUnreadCount] = useState(0)
//   const [open, setOpen] = useState(false)
//   const [loading, setLoading] = useState(true)

//   const containerRef = useRef<HTMLDivElement>(null)

//   async function loadNotifications() {
//     try {
//       const response = await fetch('/api/notifications', {
//         cache: 'no-store',
//       })

//       if (!response.ok) return

//       const data = await response.json()

//       setNotifications(data.notifications ?? [])
//       setUnreadCount(data.unreadCount ?? 0)
//     } catch (error) {
//       console.error('Notification loading error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadNotifications()

//     const interval = setInterval(() => {
//       loadNotifications()
//     }, 30000)

//     const handleFocus = () => {
//       loadNotifications()
//     }

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         loadNotifications()
//       }
//     }

//     window.addEventListener('focus', handleFocus)
//     document.addEventListener(
//       'visibilitychange',
//       handleVisibilityChange
//     )

//     return () => {
//       clearInterval(interval)
//       window.removeEventListener('focus', handleFocus)
//       document.removeEventListener(
//         'visibilitychange',
//         handleVisibilityChange
//       )
//     }
//   }, [])

//   useEffect(() => {
//     function handleOutsideClick(event: MouseEvent) {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setOpen(false)
//       }
//     }

//     if (open) {
//       document.addEventListener('mousedown', handleOutsideClick)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleOutsideClick)
//     }
//   }, [open])

//   useEffect(() => {
//     if (!open) return

//     const previousOverflow = document.body.style.overflow

//     document.body.style.overflow = 'hidden'

//     return () => {
//       document.body.style.overflow = previousOverflow
//     }
//   }, [open])

//   useEffect(() => {
//     function handleEscape(event: KeyboardEvent) {
//       if (event.key === 'Escape') {
//         setOpen(false)
//       }
//     }

//     if (open) {
//       document.addEventListener('keydown', handleEscape)
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape)
//     }
//   }, [open])

//   async function markAsRead(id: string) {
//     const notification = notifications.find(
//       (item) => item.id === id
//     )

//     if (!notification || notification.read) return

//     try {
//       const response = await fetch('/api/notifications', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           action: 'MARK_READ',
//           notificationId: id,
//         }),
//       })

//       if (!response.ok) return

//       setNotifications((current) =>
//         current.map((item) =>
//           item.id === id
//             ? { ...item, read: true }
//             : item
//         )
//       )

//       setUnreadCount((current) =>
//         Math.max(0, current - 1)
//       )
//     } catch (error) {
//       console.error('Mark notification read error:', error)
//     }
//   }

//   const previewNotifications = notifications.slice(0, 5)

//   function closeNotifications() {
//     setOpen(false)
//   }

//   return (
//     <div ref={containerRef} className="relative">
//       {/* =====================================================
//           NOTIFICATION TRIGGER
//       ===================================================== */}

//       <button
//         type="button"
//         onClick={() => setOpen((current) => !current)}
//         aria-label={
//           unreadCount > 0
//             ? `${unreadCount} unread notifications`
//             : 'Notifications'
//         }
//         aria-expanded={open}
//         className="
//           relative flex h-10 w-10 items-center justify-center
//           rounded-full border border-[#DCE4EE] bg-white
//           text-[#092B5F]
//           transition duration-200
//           hover:border-[#C7D5E5] hover:bg-[#F8FAFD]
//           focus:outline-none focus:ring-2 focus:ring-[#0B3B82]/25
//         "
//       >
//         <BellIcon />

//         {unreadCount > 0 && (
//           <span
//             className="
//               absolute -right-1 -top-1
//               flex min-h-[18px] min-w-[18px]
//               items-center justify-center
//               rounded-full border-2 border-white
//               bg-[#0B3B82]
//               px-1
//               text-[9px] font-bold leading-none text-white
//             "
//           >
//             {unreadCount > 99 ? '99+' : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* =====================================================
//           DESKTOP POPOVER
//       ===================================================== */}

//       {open && (
//         <div
//           className="
//             absolute right-0 top-full z-50 mt-3
//             hidden w-[380px]
//             overflow-hidden rounded-[22px]
//             border border-[#DCE4EE]
//             bg-white
//             shadow-[0_20px_55px_rgba(9,43,95,0.14)]
//             sm:block
//           "
//         >
//           {/* Header */}

//           <div className="border-b border-[#EEF2F6] px-5 py-4">
//             <div className="flex items-start justify-between gap-4">
//               <div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-[#F0B900]">
//                     <SparkIcon />
//                   </span>

//                   <p className="text-sm font-semibold text-[#092B5F]">
//                     Notifications
//                   </p>
//                 </div>

//                 <p className="mt-1 text-xs text-slate-500">
//                   {unreadCount > 0
//                     ? `${unreadCount} unread`
//                     : "You're all caught up"}
//                 </p>
//               </div>

//               <Link
//                 href="/notifications"
//                 onClick={closeNotifications}
//                 className="
//                   rounded-lg px-2 py-1
//                   text-xs font-semibold text-[#0B3B82]
//                   transition hover:bg-[#EEF5FF]
//                 "
//               >
//                 View all
//               </Link>
//             </div>
//           </div>

//           {/* Notifications */}

//           <div className="max-h-[430px] overflow-y-auto">
//             {loading ? (
//               <NotificationLoading />
//             ) : previewNotifications.length === 0 ? (
//               <NotificationEmpty />
//             ) : (
//               previewNotifications.map((notification) => (
//                 <NotificationItem
//                   key={notification.id}
//                   notification={notification}
//                   onRead={markAsRead}
//                   compact
//                 />
//               ))
//             )}
//           </div>

//           {notifications.length > 5 && (
//             <div className="border-t border-[#EEF2F6] px-5 py-3">
//               <Link
//                 href="/notifications"
//                 onClick={closeNotifications}
//                 className="
//                   flex min-h-9 items-center justify-center gap-2
//                   rounded-lg
//                   text-xs font-semibold text-[#0B3B82]
//                   transition hover:bg-[#F8FAFD]
//                 "
//               >
//                 See all notifications
//                 <ArrowIcon />
//               </Link>
//             </div>
//           )}
//         </div>
//       )}

//       {/* =====================================================
//           MOBILE BACKDROP
//       ===================================================== */}

//       {open && (
//         <div
//           className="
//             fixed inset-0 z-[60]
//             bg-[#092B5F]/35
//             backdrop-blur-[2px]
//             sm:hidden
//           "
//           onClick={closeNotifications}
//           aria-hidden="true"
//         />
//       )}

//       {/* =====================================================
//           MOBILE BOTTOM SHEET
//       ===================================================== */}

//       {open && (
//         <section
//           role="dialog"
//           aria-modal="true"
//           aria-label="Notifications"
//           className="
//             fixed inset-x-0 bottom-0 z-[70]
//             flex max-h-[88vh] flex-col
//             overflow-hidden
//             rounded-t-[28px]
//             border-t border-[#E2E8F0]
//             bg-[#FBFCFE]
//             shadow-[0_-18px_60px_rgba(9,43,95,0.18)]
//             sm:hidden
//           "
//         >
//           {/* Sheet handle */}

//           <div className="flex shrink-0 justify-center pt-3">
//             <div className="h-1.5 w-12 rounded-full bg-[#CBD5E1]" />
//           </div>

//           {/* Sheet header */}

//           <div className="shrink-0 px-5 pb-4 pt-4">
//             <div className="flex items-start justify-between gap-4">
//               <div className="flex items-start gap-3">
//                 <div
//                   className="
//                     mt-0.5 flex h-10 w-10 shrink-0
//                     items-center justify-center
//                     rounded-xl bg-[#FFF7D8]
//                     text-[#C18A00]
//                   "
//                 >
//                   <SparkIcon />
//                 </div>

//                 <div>
//                   <h2 className="text-[21px] font-semibold tracking-[-0.025em] text-[#092B5F]">
//                     Notifications
//                   </h2>

//                   <p className="mt-0.5 text-xs leading-5 text-slate-500">
//                     Stay connected to your Thaara Theeram journey.
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeNotifications}
//                 aria-label="Close notifications"
//                 className="
//                   flex h-9 w-9 shrink-0
//                   items-center justify-center
//                   rounded-full
//                   bg-[#F1F4F8]
//                   text-[#092B5F]
//                   transition
//                   hover:bg-[#E7EDF4]
//                   focus:outline-none focus:ring-2
//                   focus:ring-[#0B3B82]/25
//                 "
//               >
//                 <svg
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   className="h-4 w-4"
//                   aria-hidden="true"
//                 >
//                   <path
//                     d="m6 6 12 12M18 6 6 18"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Mobile status row */}

//           <div className="shrink-0 border-y border-[#E9EEF4] bg-white px-5 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`h-2 w-2 rounded-full ${
//                     unreadCount > 0
//                       ? 'bg-[#0B3B82]'
//                       : 'bg-emerald-500'
//                   }`}
//                 />

//                 <span className="text-xs font-medium text-slate-600">
//                   {unreadCount > 0
//                     ? `${unreadCount} unread notification${
//                         unreadCount === 1 ? '' : 's'
//                       }`
//                     : "You're all caught up"}
//                 </span>
//               </div>

//               <Link
//                 href="/notifications"
//                 onClick={closeNotifications}
//                 className="
//                   inline-flex items-center gap-1
//                   text-xs font-semibold text-[#0B3B82]
//                 "
//               >
//                 View all
//                 <ArrowIcon />
//               </Link>
//             </div>
//           </div>

//           {/* Scrollable notifications */}

//           <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
//             {loading ? (
//               <NotificationLoading mobile />
//             ) : previewNotifications.length === 0 ? (
//               <NotificationEmpty mobile />
//             ) : (
//               <div className="space-y-2.5">
//                 {previewNotifications.map((notification) => (
//                   <NotificationItem
//                     key={notification.id}
//                     notification={notification}
//                     onRead={markAsRead}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Bottom action */}

//           {!loading && previewNotifications.length > 0 && (
//             <div className="shrink-0 border-t border-[#E9EEF4] bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
//               <Link
//                 href="/notifications"
//                 onClick={closeNotifications}
//                 className="
//                   flex min-h-11 items-center justify-center gap-2
//                   rounded-xl
//                   bg-[#0B3B82]
//                   px-5
//                   text-sm font-semibold text-white
//                   shadow-[0_8px_20px_rgba(11,59,130,0.15)]
//                   transition duration-200
//                   hover:bg-[#092B5F]
//                   focus:outline-none focus:ring-2
//                   focus:ring-[#0B3B82]/30
//                 "
//               >
//                 View all notifications
//                 <ArrowIcon />
//               </Link>

//               <p className="mt-2.5 text-center text-[10px] font-medium tracking-wide text-slate-400">
//                 A home for every passion.
//               </p>
//             </div>
//           )}
//         </section>
//       )}
//     </div>
//   )
// }

// /* ============================================================
//    NOTIFICATION ITEM
// ============================================================ */

// function NotificationItem({
//   notification,
//   onRead,
//   compact = false,
// }: {
//   notification: Notification
//   onRead: (id: string) => void
//   compact?: boolean
// }) {
//   const unread = !notification.read

//   return (
//     <button
//       type="button"
//       onClick={() => {
//         if (unread) {
//           onRead(notification.id)
//         }
//       }}
//       className={`
//         group flex w-full text-left
//         transition duration-200
//         ${
//           compact
//             ? 'gap-3 border-b border-[#EEF2F6] px-5 py-4 hover:bg-[#F8FAFD]'
//             : 'gap-3.5 rounded-[18px] border border-[#E3E9F0] bg-white p-4 hover:border-[#CFDCEB] hover:shadow-[0_8px_24px_rgba(9,43,95,0.05)]'
//         }
//         ${unread ? 'bg-[#F4F8FE]' : ''}
//       `}
//     >
//       {/* Icon */}

//       <div
//         className={`
//           mt-0.5 flex shrink-0 items-center justify-center
//           rounded-full
//           ${
//             compact
//               ? 'h-9 w-9'
//               : 'h-10 w-10'
//           }
//           ${
//             unread
//               ? 'bg-[#E8F1FF]'
//               : 'bg-[#F1F4F7]'
//           }
//         `}
//       >
//         <NotificationTypeIcon
//           type={notification.type}
//           read={notification.read}
//         />
//       </div>

//       {/* Content */}

//       <div className="min-w-0 flex-1">
//         <div className="flex items-start gap-3">
//           <p
//             className={`
//               min-w-0 flex-1
//               ${
//                 compact
//                   ? 'text-[13px]'
//                   : 'text-[14px]'
//               }
//               leading-5
//               ${
//                 unread
//                   ? 'font-semibold text-[#092B5F]'
//                   : 'font-medium text-[#334155]'
//               }
//             `}
//           >
//             {notification.title}
//           </p>

//           {unread && (
//             <span
//               className="
//                 mt-1.5 h-2 w-2 shrink-0
//                 rounded-full bg-[#2F73E0]
//               "
//               aria-label="Unread"
//             />
//           )}
//         </div>

//         <p
//           className={`
//             mt-1
//             line-clamp-2
//             ${
//               compact
//                 ? 'text-[11px]'
//                 : 'text-xs'
//             }
//             leading-5 text-slate-500
//           `}
//         >
//           {notification.message}
//         </p>

//         <div className="mt-2 flex items-center justify-between gap-3">
//           <p className="text-[10px] font-medium text-slate-400">
//             {formatTime(notification.created_at)}
//           </p>

//           {!compact && (
//             <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0B3B82]">
//               <ChevronIcon />
//             </span>
//           )}
//         </div>
//       </div>
//     </button>
//   )
// }

// /* ============================================================
//    LOADING
// ============================================================ */

// function NotificationLoading({
//   mobile = false,
// }: {
//   mobile?: boolean
// }) {
//   return (
//     <div className={mobile ? 'space-y-2.5' : ''}>
//       {[1, 2, 3].map((item) => (
//         <div
//           key={item}
//           className={`
//             flex gap-3
//             ${
//               mobile
//                 ? 'rounded-[18px] border border-[#E3E9F0] bg-white p-4'
//                 : 'border-b border-[#EEF2F6] px-5 py-4'
//             }
//           `}
//         >
//           <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />

//           <div className="flex-1 space-y-2 pt-1">
//             <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
//             <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
//             <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// /* ============================================================
//    EMPTY
// ============================================================ */

// function NotificationEmpty({
//   mobile = false,
// }: {
//   mobile?: boolean
// }) {
//   return (
//     <div
//       className={`
//         text-center
//         ${mobile ? 'px-6 py-14' : 'px-5 py-12'}
//       `}
//     >
//       <div
//         className="
//           mx-auto flex h-12 w-12
//           items-center justify-center
//           rounded-2xl bg-[#FFF7D8]
//           text-[#B47C00]
//         "
//       >
//         <SparkIcon />
//       </div>

//       <p className="mt-4 text-sm font-semibold text-[#092B5F]">
//         Nothing new here.
//       </p>

//       <p className="mx-auto mt-1.5 max-w-[270px] text-xs leading-5 text-slate-500">
//         Important updates about your clubs and responsibilities will
//         appear here.
//       </p>
//     </div>
//   )
// }



'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

/* ============================================================
   HELPERS
============================================================ */

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

/* ============================================================
   ICONS
============================================================ */

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[19px] w-[19px]"
      aria-hidden="true"
    >
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 21h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ============================================================
   NOTIFICATION TYPE ICON
============================================================ */

function NotificationTypeIcon({
  type,
  read,
}: {
  type: string
  read: boolean
}) {
  const iconClass = read
    ? 'text-slate-500'
    : 'text-[#0B3B82]'

  if (type.includes('APPROVED')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 ${iconClass}`}
        aria-hidden="true"
      >
        <path
          d="m6 12 4 4 8-8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type.includes('REJECTED')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 ${
          read ? 'text-slate-500' : 'text-red-600'
        }`}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M9 9l6 6M15 9l-6 6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (type.includes('INVITATION')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 ${
          read ? 'text-slate-500' : 'text-[#8A6500]'
        }`}
        aria-hidden="true"
      >
        <path
          d="m12 3 1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (
    type.includes('HEAD') ||
    type.includes('ROLE')
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 ${iconClass}`}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="8"
          r="3.2"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M5 20a7 7 0 0 1 14 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <path
          d="M18 5v4M16 7h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (
    type.includes('MEMBER') ||
    type.includes('CLUB') ||
    type.includes('JOIN')
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 ${iconClass}`}
        aria-hidden="true"
      >
        <circle
          cx="9"
          cy="8"
          r="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M3.5 19a5.5 5.5 0 0 1 11 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M17 8v6M14 11h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <BellIcon />
  )
}

/* ============================================================
   MAIN
============================================================ */

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([])
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [mounted, setMounted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  /* ----------------------------------------------------------
     PORTAL MOUNT
  ---------------------------------------------------------- */

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ----------------------------------------------------------
     LOAD NOTIFICATIONS
  ---------------------------------------------------------- */

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
      console.error(
        'Notification loading error:',
        error
      )
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
      if (
        document.visibilityState === 'visible'
      ) {
        loadNotifications()
      }
    }

    window.addEventListener(
      'focus',
      handleFocus
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )

    return () => {
      clearInterval(interval)

      window.removeEventListener(
        'focus',
        handleFocus
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
    }
  }, [])

  /* ----------------------------------------------------------
     DESKTOP OUTSIDE CLICK
  ---------------------------------------------------------- */

  useEffect(() => {
  function handleOutsideClick(event: MouseEvent) {
    // This listener is only for the desktop popover.
    // Mobile notifications are rendered through a portal,
    // so clicks inside the mobile sheet must not be treated
    // as outside clicks.
    if (
      window.matchMedia('(max-width: 639px)').matches
    ) {
      return
    }

    if (
      containerRef.current &&
      !containerRef.current.contains(
        event.target as Node
      )
    ) {
      setOpen(false)
    }
  }

  if (open) {
    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )
  }

  return () => {
    document.removeEventListener(
      'mousedown',
      handleOutsideClick
    )
  }
}, [open])

  /* ----------------------------------------------------------
     LOCK BODY WHEN OPEN
  ---------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow =
        previousOverflow
    }
  }, [open])

  /* ----------------------------------------------------------
     ESCAPE
  ---------------------------------------------------------- */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener(
        'keydown',
        handleEscape
      )
    }

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [open])

  /* ----------------------------------------------------------
     MARK READ
  ---------------------------------------------------------- */

  async function markAsRead(id: string) {
    const notification =
      notifications.find(
        (item) => item.id === id
      )

    if (
      !notification ||
      notification.read
    ) {
      return
    }

    try {
      const response = await fetch(
        '/api/notifications',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            action: 'MARK_READ',
            notificationId: id,
          }),
        }
      )

      if (!response.ok) {
        return
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      )

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      )
    } catch (error) {
      console.error(
        'Mark notification read error:',
        error
      )
    }
  }

  const previewNotifications =
    notifications.slice(0, 5)

  function closeNotifications() {
    setOpen(false)
  }

  /* ==========================================================
     TRIGGER + DESKTOP
  ========================================================== */

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
      >
        {/* Trigger */}

        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) => !current
            )
          }
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
          aria-expanded={open}
          className="
            relative flex h-10 w-10
            items-center justify-center
            rounded-full
            border border-[#DCE4EE]
            bg-white
            text-[#092B5F]
            transition duration-200
            hover:border-[#C7D5E5]
            hover:bg-[#F8FAFD]
            focus:outline-none
            focus:ring-2
            focus:ring-[#0B3B82]/25
          "
        >
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className="
                absolute -right-1 -top-1
                flex min-h-[18px] min-w-[18px]
                items-center justify-center
                rounded-full
                border-2 border-white
                bg-[#0B3B82]
                px-1
                text-[9px] font-bold
                leading-none text-white
              "
            >
              {unreadCount > 99
                ? '99+'
                : unreadCount}
            </span>
          )}
        </button>

        {/* Desktop popover */}

        {open && (
          <div
            className="
              absolute right-0 top-full z-50 mt-3
              hidden w-[380px]
              overflow-hidden
              rounded-[22px]
              border border-[#DCE4EE]
              bg-white
              shadow-[0_20px_55px_rgba(9,43,95,0.14)]
              sm:block
            "
          >
            <div className="border-b border-[#EEF2F6] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F0B900]">
                      <SparkIcon />
                    </span>

                    <p className="text-sm font-semibold text-[#092B5F]">
                      Notifications
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>

                <Link
                  href="/notifications"
                  onClick={
                    closeNotifications
                  }
                  className="
                    rounded-lg px-2 py-1
                    text-xs font-semibold
                    text-[#0B3B82]
                    transition
                    hover:bg-[#EEF5FF]
                  "
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="max-h-[430px] overflow-y-auto">
              {loading ? (
                <NotificationLoading />
              ) : previewNotifications.length ===
                0 ? (
                <NotificationEmpty />
              ) : (
                previewNotifications.map(
                  (notification) => (
                    <NotificationItem
  key={notification.id}
  notification={notification}
  onRead={markAsRead}
  onOpen={() => {
    closeNotifications()
    router.push('/notifications')
  }}
  compact
/>
                  )
                )
              )}
            </div>

            {notifications.length > 5 && (
              <div className="border-t border-[#EEF2F6] px-5 py-3">
                <Link
                  href="/notifications"
                  onClick={
                    closeNotifications
                  }
                  className="
                    flex min-h-9
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    text-xs font-semibold
                    text-[#0B3B82]
                    transition
                    hover:bg-[#F8FAFD]
                  "
                >
                  See all notifications
                  <ArrowIcon />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          MOBILE PORTAL
      ======================================================== */}

      {mounted &&
        open &&
        createPortal(
          <>
            {/* Backdrop */}

            <div
              className="
                fixed inset-0 z-[9998]
                bg-[#061D40]/45
                backdrop-blur-[2px]
                sm:hidden
              "
              onClick={closeNotifications}
              aria-hidden="true"
            />

            {/* Bottom sheet */}

            <section
              role="dialog"
              aria-modal="true"
              aria-label="Notifications"
              className="
                fixed inset-x-0 bottom-0
                z-[9999]
                flex
                max-h-[88dvh]
                flex-col
                overflow-hidden
                rounded-t-[28px]
                border-t border-[#E2E8F0]
                bg-[#F8FAFD]
                shadow-[0_-20px_70px_rgba(9,43,95,0.20)]
                sm:hidden
              "
            >
              {/* Handle */}

              <div className="flex shrink-0 justify-center pt-3">
                <div
                  className="
                    h-1.5 w-12
                    rounded-full
                    bg-[#C7D0DB]
                  "
                />
              </div>

              {/* Header */}

              <div className="shrink-0 px-5 pb-4 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        mt-0.5 flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#FFF7D8]
                        text-[#B47C00]
                      "
                    >
                      <SparkIcon />
                    </div>

                    <div>
                      <h2
                        className="
                          text-[21px]
                          font-semibold
                          tracking-[-0.025em]
                          text-[#092B5F]
                        "
                      >
                        Notifications
                      </h2>

                      <p
                        className="
                          mt-0.5
                          max-w-[250px]
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        Stay connected to your
                        Thaara Theeram journey.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeNotifications
                    }
                    aria-label="Close notifications"
                    className="
                      flex h-9 w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#EDF1F5]
                      text-[#092B5F]
                      transition
                      hover:bg-[#E3E8EE]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#0B3B82]/25
                    "
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              {/* Status */}

              <div
                className="
                  shrink-0
                  border-y border-[#E5EBF1]
                  bg-white
                  px-5 py-3
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`
                        h-2 w-2 shrink-0
                        rounded-full
                        ${
                          unreadCount > 0
                            ? 'bg-[#0B3B82]'
                            : 'bg-emerald-500'
                        }
                      `}
                    />

                    <span
                      className="
                        truncate
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount === 1
                              ? ''
                              : 's'
                          }`
                        : "You're all caught up"}
                    </span>
                  </div>

                  <Link
                    href="/notifications"
                    onClick={
                      closeNotifications
                    }
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1
                      text-xs
                      font-semibold
                      text-[#0B3B82]
                    "
                  >
                    View all
                    <ArrowIcon />
                  </Link>
                </div>
              </div>

              {/* Notification list */}

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  px-4
                  py-3
                "
              >
                {loading ? (
                  <NotificationLoading
                    mobile
                  />
                ) : previewNotifications.length ===
                  0 ? (
                  <NotificationEmpty
                    mobile
                  />
                ) : (
                  <div className="space-y-2.5">
                    {previewNotifications.map(
                      (notification) => (
                        <NotificationItem
  key={notification.id}
  notification={notification}
  onRead={markAsRead}
  onOpen={() => {
    closeNotifications()
    router.push('/notifications')
  }}
/>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Bottom action */}

              {!loading &&
                previewNotifications.length >
                  0 && (
                  <div
                    className="
                      shrink-0
                      border-t
                      border-[#E5EBF1]
                      bg-white
                      px-4
                      pb-[max(14px,env(safe-area-inset-bottom))]
                      pt-3
                    "
                  >
                    <Link
                      href="/notifications"
                      onClick={
                        closeNotifications
                      }
                      className="
                        flex min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#0B3B82]
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_8px_20px_rgba(11,59,130,0.16)]
                        transition
                        hover:bg-[#092B5F]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#0B3B82]/30
                      "
                    >
                      View all notifications
                      <ArrowIcon />
                    </Link>

                    <p
                      className="
                        mt-2.5
                        text-center
                        text-[10px]
                        font-medium
                        tracking-wide
                        text-slate-400
                      "
                    >
                      A home for every passion.
                    </p>
                  </div>
                )}
            </section>
          </>,
          document.body
        )}
    </>
  )
}

/* ============================================================
   NOTIFICATION ITEM
============================================================ */

function NotificationItem({
  notification,
  onRead,
  onOpen,
  compact = false,
}: {
  notification: Notification
  onRead: (id: string) => void
  onOpen: () => void
  compact?: boolean
})  {
  const unread = !notification.read

  return (
    <button
      type="button"
      onClick={async () => {
  if (unread) {
    await onRead(notification.id)
  }

  onOpen()
}}
      className={`
        group flex w-full
        text-left
        transition duration-200
        ${
          compact
            ? `
              gap-3
              border-b
              border-[#EEF2F6]
              px-5 py-4
              hover:bg-[#F8FAFD]
            `
            : `
              gap-3.5
              rounded-[18px]
              border
              border-[#E3E9F0]
              bg-white
              p-4
              hover:border-[#CFDCEB]
              hover:shadow-[0_8px_24px_rgba(9,43,95,0.05)]
            `
        }
        ${
          unread
            ? compact
              ? 'bg-[#F4F8FE]'
              : 'bg-[#F7FAFF]'
            : ''
        }
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#0B3B82]/25
      `}
    >
      {/* Icon */}

      <div
        className={`
          mt-0.5
          flex
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            compact
              ? 'h-9 w-9'
              : 'h-10 w-10'
          }
          ${
            unread
              ? 'bg-[#E8F1FF]'
              : 'bg-[#F1F4F7]'
          }
        `}
      >
        <NotificationTypeIcon
          type={notification.type}
          read={notification.read}
        />
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <p
            className={`
              min-w-0
              flex-1
              leading-5
              ${
                compact
                  ? 'text-[13px]'
                  : 'text-[14px]'
              }
              ${
                unread
                  ? 'font-semibold text-[#092B5F]'
                  : 'font-medium text-[#334155]'
              }
            `}
          >
            {notification.title}
          </p>

          {unread && (
            <span
              className="
                mt-1.5
                h-2 w-2
                shrink-0
                rounded-full
                bg-[#2F73E0]
              "
              aria-label="Unread"
            />
          )}
        </div>

        <p
          className={`
            mt-1
            line-clamp-2
            leading-5
            ${
              compact
                ? 'text-[11px]'
                : 'text-xs'
            }
            text-slate-500
          `}
        >
          {notification.message}
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            className="
              text-[10px]
              font-medium
              text-slate-400
            "
          >
            {formatTime(
              notification.created_at
            )}
          </p>

          {!compact && (
            <span
              className="
                text-slate-300
                transition
                group-hover:translate-x-0.5
                group-hover:text-[#0B3B82]
              "
            >
              <ChevronIcon />
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

/* ============================================================
   LOADING
============================================================ */

function NotificationLoading({
  mobile = false,
}: {
  mobile?: boolean
}) {
  return (
    <div
      className={
        mobile
          ? 'space-y-2.5'
          : ''
      }
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={`
            flex gap-3
            ${
              mobile
                ? `
                  rounded-[18px]
                  border
                  border-[#E3E9F0]
                  bg-white
                  p-4
                `
                : `
                  border-b
                  border-[#EEF2F6]
                  px-5 py-4
                `
            }
          `}
        >
          <div
            className="
              h-10 w-10
              shrink-0
              animate-pulse
              rounded-full
              bg-slate-100
            "
          />

          <div
            className="
              flex-1
              space-y-2
              pt-1
            "
          >
            <div
              className="
                h-3.5
                w-3/4
                animate-pulse
                rounded
                bg-slate-100
              "
            />

            <div
              className="
                h-3
                w-full
                animate-pulse
                rounded
                bg-slate-100
              "
            />

            <div
              className="
                h-2.5
                w-16
                animate-pulse
                rounded
                bg-slate-100
              "
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   EMPTY
============================================================ */

function NotificationEmpty({
  mobile = false,
}: {
  mobile?: boolean
}) {
  return (
    <div
      className={`
        text-center
        ${
          mobile
            ? 'px-6 py-14'
            : 'px-5 py-12'
        }
      `}
    >
      <div
        className="
          mx-auto
          flex h-12 w-12
          items-center
          justify-center
          rounded-2xl
          bg-[#FFF7D8]
          text-[#B47C00]
        "
      >
        <SparkIcon />
      </div>

      <p
        className="
          mt-4
          text-sm
          font-semibold
          text-[#092B5F]
        "
      >
        Nothing new here.
      </p>

      <p
        className="
          mx-auto
          mt-1.5
          max-w-[270px]
          text-xs
          leading-5
          text-slate-500
        "
      >
        Important updates about your
        clubs and responsibilities will
        appear here.
      </p>
    </div>
  )
}