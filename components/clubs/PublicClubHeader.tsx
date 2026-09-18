// 'use client'

// import Link from 'next/link'
// import { useEffect, useState } from 'react'

// type ClubStatus =
//   | 'JOIN'
//   | 'PENDING'
//   | 'MEMBER'
//   | 'HEAD'
//   | 'COORDINATOR'

// type PublicClubHeaderProps = {
//   clubName: string
//   slug: string
//   user: boolean
//   currentClubStatus: ClubStatus
// }

// /* ============================================================
//    ICONS
// ============================================================ */

// function MenuIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-5 w-5"
//       aria-hidden="true"
//     >
//       <path
//         d="M4 7h16M4 12h16M4 17h16"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//     </svg>
//   )
// }

// function CloseIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-5 w-5"
//       aria-hidden="true"
//     >
//       <path
//         d="m6 6 12 12M18 6 6 18"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//     </svg>
//   )
// }

// function ArrowLeftIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-4 w-4"
//       aria-hidden="true"
//     >
//       <path
//         d="M19 12H5M11 6l-6 6 6 6"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   )
// }

// function ArrowRightIcon() {
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

// function DashboardIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-4 w-4"
//       aria-hidden="true"
//     >
//       <rect
//         x="4"
//         y="4"
//         width="6"
//         height="6"
//         rx="1"
//         stroke="currentColor"
//         strokeWidth="1.7"
//       />

//       <rect
//         x="14"
//         y="4"
//         width="6"
//         height="6"
//         rx="1"
//         stroke="currentColor"
//         strokeWidth="1.7"
//       />

//       <rect
//         x="4"
//         y="14"
//         width="6"
//         height="6"
//         rx="1"
//         stroke="currentColor"
//         strokeWidth="1.7"
//       />

//       <rect
//         x="14"
//         y="14"
//         width="6"
//         height="6"
//         rx="1"
//         stroke="currentColor"
//         strokeWidth="1.7"
//       />
//     </svg>
//   )
// }

// function ManageIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className="h-4 w-4"
//       aria-hidden="true"
//     >
//       <path
//         d="M12 3v18M3 12h18"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinecap="round"
//       />

//       <circle
//         cx="12"
//         cy="12"
//         r="8.5"
//         stroke="currentColor"
//         strokeWidth="1.2"
//         opacity="0.45"
//       />
//     </svg>
//   )
// }

// /* ============================================================
//    HEADER
// ============================================================ */

// export default function PublicClubHeader({
//   clubName,
//   slug,
//   user,
//   currentClubStatus,
// }: PublicClubHeaderProps) {
//   const [mobileOpen, setMobileOpen] = useState(false)

//   const canManage =
//     currentClubStatus === 'HEAD' ||
//     currentClubStatus === 'COORDINATOR'

//   /*
//    * Prevent background page scrolling while the mobile
//    * navigation is open.
//    */
//   useEffect(() => {
//     if (!mobileOpen) {
//       document.body.style.overflow = ''
//       return
//     }

//     document.body.style.overflow = 'hidden'

//     return () => {
//       document.body.style.overflow = ''
//     }
//   }, [mobileOpen])

//   /*
//    * Close mobile navigation when the viewport becomes desktop.
//    */
//   useEffect(() => {
//     function handleResize() {
//       if (window.innerWidth >= 640) {
//         setMobileOpen(false)
//       }
//     }

//     window.addEventListener('resize', handleResize)

//     return () => {
//       window.removeEventListener(
//         'resize',
//         handleResize
//       )
//     }
//   }, [])

//   return (
//     <>
//       {/* ======================================================
//           DESKTOP / MOBILE HEADER
//       ====================================================== */}

//       <header
//         className="
//           sticky
//           top-0
//           z-[100]
//           border-b
//           border-slate-200/80
//           bg-white/95
//           backdrop-blur-xl
//         "
//       >
//         <div
//           className="
//             mx-auto
//             flex
//             h-[68px]
//             max-w-[1440px]
//             items-center
//             justify-between
//             px-4
//             sm:px-8
//             lg:px-12
//           "
//         >
//           {/* --------------------------------------------------
//               LEFT CONTEXT
//           -------------------------------------------------- */}

//           <Link
//             href="/clubs"
//             className="
//               group
//               inline-flex
//               min-h-10
//               items-center
//               gap-2
//               rounded-xl
//               px-2
//               text-sm
//               font-semibold
//               text-slate-500
//               transition-all
//               duration-200
//               hover:bg-slate-50
//               hover:text-[#092B5F]
//               focus:outline-none
//               focus-visible:ring-4
//               focus-visible:ring-[#0B3B82]/10
//             "
//           >
//             <ArrowLeftIcon />

//             <span>Clubs</span>
//           </Link>

//           {/* --------------------------------------------------
//               DESKTOP ACTIONS
//           -------------------------------------------------- */}

//           <div className="hidden items-center gap-7 sm:flex">
//             {canManage && user && (
//               <Link
//                 href={`/clubs/${slug}/manage`}
//                 className="
//                   rounded-lg
//                   px-2
//                   py-2
//                   text-sm
//                   font-bold
//                   text-[#0B3B82]
//                   transition-colors
//                   duration-200
//                   hover:text-[#092B5F]
//                   focus:outline-none
//                   focus-visible:ring-4
//                   focus-visible:ring-[#0B3B82]/10
//                 "
//               >
//                 Manage Club
//               </Link>
//             )}

//             {user ? (
//               <Link
//                 href="/dashboard"
//                 className="
//                   inline-flex
//                   min-h-11
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#0B3B82]
//                   px-5
//                   text-sm
//                   font-bold
//                   text-white
//                   shadow-[0_4px_14px_rgba(11,59,130,0.16)]
//                   transition-all
//                   duration-200
//                   hover:-translate-y-0.5
//                   hover:bg-[#092F6A]
//                   hover:shadow-[0_8px_22px_rgba(11,59,130,0.2)]
//                   focus:outline-none
//                   focus-visible:ring-4
//                   focus-visible:ring-[#0B3B82]/15
//                 "
//               >
//                 Dashboard
//               </Link>
//             ) : (
//               <Link
//                 href={`/login?returnTo=/clubs/${slug}`}
//                 className="
//                   inline-flex
//                   min-h-11
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#0B3B82]
//                   px-5
//                   text-sm
//                   font-bold
//                   text-white
//                   shadow-[0_4px_14px_rgba(11,59,130,0.16)]
//                   transition-all
//                   duration-200
//                   hover:bg-[#092F6A]
//                   focus:outline-none
//                   focus-visible:ring-4
//                   focus-visible:ring-[#0B3B82]/15
//                 "
//               >
//                 Login
//               </Link>
//             )}
//           </div>

//           {/* --------------------------------------------------
//               MOBILE ACTIONS
//           -------------------------------------------------- */}

//           <div className="flex items-center gap-2 sm:hidden">
//             {user ? (
//               <Link
//                 href="/dashboard"
//                 className="
//                   inline-flex
//                   min-h-10
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#0B3B82]
//                   px-4
//                   text-sm
//                   font-bold
//                   text-white
//                   shadow-sm
//                   transition
//                   hover:bg-[#092F6A]
//                   focus:outline-none
//                   focus-visible:ring-4
//                   focus-visible:ring-[#0B3B82]/15
//                 "
//               >
//                 Dashboard
//               </Link>
//             ) : (
//               <Link
//                 href={`/login?returnTo=/clubs/${slug}`}
//                 className="
//                   inline-flex
//                   min-h-10
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#0B3B82]
//                   px-4
//                   text-sm
//                   font-bold
//                   text-white
//                   shadow-sm
//                 "
//               >
//                 Login
//               </Link>
//             )}

//             <button
//               type="button"
//               onClick={() =>
//                 setMobileOpen((current) => !current)
//               }
//               aria-label={
//                 mobileOpen
//                   ? 'Close club navigation'
//                   : 'Open club navigation'
//               }
//               aria-expanded={mobileOpen}
//               className="
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-white
//                 text-[#092B5F]
//                 transition-all
//                 duration-200
//                 hover:bg-slate-50
//                 focus:outline-none
//                 focus-visible:ring-4
//                 focus-visible:ring-[#0B3B82]/10
//               "
//             >
//               {mobileOpen ? (
//                 <CloseIcon />
//               ) : (
//                 <MenuIcon />
//               )}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ======================================================
//           MOBILE NAVIGATION
//       ====================================================== */}

//       {mobileOpen && (
//         <div className="fixed inset-0 z-[90] sm:hidden">
//           {/* Backdrop */}

//           <button
//             type="button"
//             aria-label="Close navigation"
//             onClick={() => setMobileOpen(false)}
//             className="
//               absolute
//               inset-0
//               bg-[#092B5F]/25
//               backdrop-blur-[2px]
//             "
//           />

//           {/* Panel */}

//           <div
//             className="
//               absolute
//               left-3
//               right-3
//               top-[80px]
//               overflow-hidden
//               rounded-[1.5rem]
//               border
//               border-slate-200
//               bg-white
//               shadow-[0_24px_70px_rgba(9,43,95,0.2)]
//             "
//           >
//             {/* Context */}

//             <div
//               className="
//                 border-b
//                 border-slate-100
//                 bg-[#F8FAFD]
//                 px-5
//                 py-5
//               "
//             >
//               <p
//                 className="
//                   text-[10px]
//                   font-black
//                   uppercase
//                   tracking-[0.2em]
//                   text-[#0B3B82]
//                 "
//               >
//                 Club navigation
//               </p>

//               <p
//                 className="
//                   mt-1.5
//                   truncate
//                   text-base
//                   font-bold
//                   text-[#092B5F]
//                 "
//               >
//                 {clubName}
//               </p>
//             </div>

//             {/* Navigation */}

//             <nav className="p-3">
//               {/* All clubs */}

//               <Link
//                 href="/clubs"
//                 onClick={() => setMobileOpen(false)}
//                 className="
//                   flex
//                   min-h-12
//                   items-center
//                   gap-3
//                   rounded-xl
//                   px-3
//                   text-sm
//                   font-semibold
//                   text-slate-600
//                   transition
//                   hover:bg-[#F8FAFD]
//                   hover:text-[#092B5F]
//                 "
//               >
//                 <span
//                   className="
//                     flex
//                     h-9
//                     w-9
//                     shrink-0
//                     items-center
//                     justify-center
//                     rounded-lg
//                     bg-slate-100
//                     text-slate-500
//                   "
//                 >
//                   <ArrowLeftIcon />
//                 </span>

//                 <span className="flex-1">
//                   All clubs
//                 </span>

//                 <ArrowRightIcon />
//               </Link>

//               {/* Manage Club */}

//               {canManage && user && (
//                 <Link
//                   href={`/clubs/${slug}/manage`}
//                   onClick={() => setMobileOpen(false)}
//                   className="
//                     mt-1
//                     flex
//                     min-h-12
//                     items-center
//                     gap-3
//                     rounded-xl
//                     bg-[#EEF5FF]
//                     px-3
//                     text-sm
//                     font-bold
//                     text-[#0B3B82]
//                     transition
//                     hover:bg-[#E4F0FF]
//                   "
//                 >
//                   <span
//                     className="
//                       flex
//                       h-9
//                       w-9
//                       shrink-0
//                       items-center
//                       justify-center
//                       rounded-lg
//                       bg-white
//                       text-[#0B3B82]
//                       shadow-sm
//                     "
//                   >
//                     <ManageIcon />
//                   </span>

//                   <span className="flex-1">
//                     Manage Club
//                   </span>

//                   <ArrowRightIcon />
//                 </Link>
//               )}

//               {/* Dashboard */}

//               {user && (
//                 <Link
//                   href="/dashboard"
//                   onClick={() => setMobileOpen(false)}
//                   className="
//                     mt-1
//                     flex
//                     min-h-12
//                     items-center
//                     gap-3
//                     rounded-xl
//                     px-3
//                     text-sm
//                     font-semibold
//                     text-slate-600
//                     transition
//                     hover:bg-[#F8FAFD]
//                     hover:text-[#092B5F]
//                   "
//                 >
//                   <span
//                     className="
//                       flex
//                       h-9
//                       w-9
//                       shrink-0
//                       items-center
//                       justify-center
//                       rounded-lg
//                       bg-slate-100
//                       text-slate-500
//                     "
//                   >
//                     <DashboardIcon />
//                   </span>

//                   <span className="flex-1">
//                     Dashboard
//                   </span>

//                   <ArrowRightIcon />
//                 </Link>
//               )}

//               {/* Login */}

//               {!user && (
//                 <Link
//                   href={`/login?returnTo=/clubs/${slug}`}
//                   onClick={() => setMobileOpen(false)}
//                   className="
//                     mt-2
//                     flex
//                     min-h-12
//                     items-center
//                     justify-center
//                     rounded-xl
//                     bg-[#0B3B82]
//                     px-4
//                     text-sm
//                     font-bold
//                     text-white
//                     transition
//                     hover:bg-[#092F6A]
//                   "
//                 >
//                   Student Login
//                 </Link>
//               )}
//             </nav>

//             {/* Footer context */}

//             <div
//               className="
//                 border-t
//                 border-slate-100
//                 px-5
//                 py-4
//               "
//             >
//               <p
//                 className="
//                   text-center
//                   text-[10px]
//                   font-bold
//                   tracking-[0.12em]
//                   text-slate-400
//                 "
//               >
//                 THAARA THEERAM
//                 <span className="mx-1.5">
//                   •
//                 </span>
//                 A home for every passion.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type ClubStatus =
  | 'JOIN'
  | 'PENDING'
  | 'MEMBER'
  | 'HEAD'
  | 'COORDINATOR'

type PublicClubHeaderProps = {
  clubName: string
  slug: string
  user: boolean
  currentClubStatus: ClubStatus
  isAdmin: boolean
}

/* ============================================================
   ICONS
============================================================ */

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
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

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
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
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function ManageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path
        d="M12 4v16M4 12h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.45"
      />
    </svg>
  )
}

/* ============================================================
   HEADER
============================================================ */

export default function PublicClubHeader({
  clubName,
  slug,
  user,
  currentClubStatus,
  isAdmin,
}: PublicClubHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const canManage =
    currentClubStatus === 'HEAD' ||
    currentClubStatus === 'COORDINATOR' ||
    isAdmin

  /* Prevent background scrolling when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  /* Close menu if viewport changes to desktop */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 640) {
        setMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  return (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-[5] border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">

          {/* BACK TO CLUBS */}

          <Link
            href="/clubs"
            className="group inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-[#092B5F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
          >
            <ChevronLeftIcon />

            <span>Clubs</span>
          </Link>

          {/* ==================================================
              DESKTOP
          ================================================== */}

          <div className="hidden items-center gap-7 sm:flex">

            {user && canManage && (
              <Link
                href={`/clubs/${slug}/manage`}
                className="rounded-lg px-2 py-2 text-sm font-bold text-[#0B3B82] transition-colors duration-200 hover:bg-[#F8FAFD] hover:text-[#092B5F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
              >
                Manage Club
              </Link>
            )}

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B3B82] px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(11,59,130,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#092F6A] hover:shadow-[0_8px_22px_rgba(11,59,130,0.2)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={`/login?returnTo=/clubs/${slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B3B82] px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#092F6A] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
              >
                Login
              </Link>
            )}
          </div>

          {/* ==================================================
              MOBILE
          ================================================== */}

          <div className="flex items-center gap-2 sm:hidden">

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#092F6A]"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={`/login?returnTo=/clubs/${slug}`}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white shadow-sm"
              >
                Login
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-label={
                mobileOpen
                  ? 'Close club navigation'
                  : 'Open club navigation'
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#092B5F] transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] sm:hidden">

          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-[#092B5F]/25 backdrop-blur-[2px]"
          />

          {/* Menu */}

          <div className="absolute left-3 right-3 top-[80px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(9,43,95,0.22)]">

            {/* Club context */}

            <div className="border-b border-slate-100 bg-[#F8FAFD] px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B3B82]">
                Club navigation
              </p>

              <p className="mt-1.5 truncate text-base font-black text-[#092B5F]">
                {clubName}
              </p>
            </div>

            {/* Links */}

            <nav className="p-3">

              {/* ALL CLUBS */}

              <Link
                href="/clubs"
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-[#F8FAFD] hover:text-[#092B5F]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <ChevronLeftIcon />
                </span>

                <span className="flex-1">
                  All clubs
                </span>

                <ChevronRightIcon />
              </Link>

              {/* MANAGE CLUB */}

              {user && canManage && (
                <Link
                  href={`/clubs/${slug}/manage`}
                  onClick={closeMobileMenu}
                  className="mt-1 flex min-h-12 items-center gap-3 rounded-xl bg-[#EEF5FF] px-3 text-sm font-bold text-[#0B3B82] transition hover:bg-[#E4F0FF]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0B3B82] shadow-sm">
                    <ManageIcon />
                  </span>

                  <span className="flex-1">
                    Manage Club
                  </span>

                  <ChevronRightIcon />
                </Link>
              )}

              {/* DASHBOARD */}

              {user && (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="mt-1 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-[#F8FAFD] hover:text-[#092B5F]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <DashboardIcon />
                  </span>

                  <span className="flex-1">
                    Dashboard
                  </span>

                  <ChevronRightIcon />
                </Link>
              )}

              {/* LOGIN */}

              {!user && (
                <Link
                  href={`/login?returnTo=/clubs/${slug}`}
                  onClick={closeMobileMenu}
                  className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition hover:bg-[#092F6A]"
                >
                  Student Login
                </Link>
              )}
            </nav>

            {/* Footer */}

            <div className="border-t border-slate-100 px-5 py-4">
              <p className="text-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                THAARA THEERAM
                <span className="mx-1.5">•</span>
                A home for every passion.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}