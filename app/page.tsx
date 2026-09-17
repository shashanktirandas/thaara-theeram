// // 'use client'

// // import Link from 'next/link'
// // import { useEffect, useState } from 'react'
// // import { createClient } from '@/lib/supabase/client'

// // type Club = {
// //   id: string
// //   name: string
// //   slug: string
// //   category: string | null
// //   short_description: string | null
// //   description: string | null
// //   logo_url: string | null
// // }

// // type Student = {
// //   id: string
// //   roll_number: string
// //   name: string
// //   department: string
// //   year: string
// //   section: string
// // }

// // type AuthMeResponse = {
// //   authenticated: boolean
// //   student?: Student
// //   isAdmin?: boolean
// //   memberships?: Array<{
// //     club_id: string
// //     role: string
// //     status: string
// //     clubs: {
// //       id: string
// //       name: string
// //       slug: string
// //     } | null
// //   }>
// // }

// // const categoryIcons: Record<string, string> = {
// //   Technical: '⌘',
// //   Cultural: '✦',
// //   'Arts & Media': '◈',
// //   Sports: '⚡',
// //   Literary: 'Aa',
// //   'Social & Service': '♡',
// //   Entrepreneurship: '↗',
// //   Academic: '∑',
// //   Other: '•',
// // }

// // export default function HomePage() {
// //   const [clubs, setClubs] = useState<Club[]>([])
// //   const [loadingClubs, setLoadingClubs] = useState(true)

// //   const [authLoading, setAuthLoading] = useState(true)
// //   const [authenticated, setAuthenticated] = useState(false)
// //   const [student, setStudent] = useState<Student | null>(null)
// //   const [isAdmin, setIsAdmin] = useState(false)

// //   useEffect(() => {
// //     loadHomeData()
// //   }, [])

// //   async function loadHomeData() {
// //     const supabase = createClient()

// //     // ---------------------------------------------------------
// //     // Load public clubs
// //     // ---------------------------------------------------------

// //     const { data: clubsData, error: clubsError } = await supabase
// //       .from('clubs')
// //       .select(
// //         `
// //           id,
// //           name,
// //           slug,
// //           category,
// //           short_description,
// //           description,
// //           logo_url
// //         `
// //       )
// //       .eq('status', 'ACTIVE')
// //       .order('name', { ascending: true })

// //     if (!clubsError && clubsData) {
// //       setClubs(clubsData)
// //     }

// //     setLoadingClubs(false)

// //     // ---------------------------------------------------------
// //     // Load current student session
// //     // ---------------------------------------------------------

// //     try {
// //       const response = await fetch('/api/auth/me', {
// //         method: 'GET',
// //         credentials: 'include',
// //         cache: 'no-store',
// //       })

// //       if (response.ok) {
// //         const data: AuthMeResponse = await response.json()

// //         if (data.authenticated && data.student) {
// //           setAuthenticated(true)
// //           setStudent(data.student)
// //           setIsAdmin(!!data.isAdmin)
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Could not load session:', error)
// //     } finally {
// //       setAuthLoading(false)
// //     }
// //   }

// //   return (
// //     <main className="min-h-screen bg-white text-slate-950">

// //       {/* =====================================================
// //           NAVIGATION
// //       ===================================================== */}

// //       <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
// //         <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

// //           <Link
// //             href="/"
// //             className="flex items-center gap-3"
// //           >
// //             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B82] text-lg font-black text-white">
// //               T
// //             </div>

// //             <div className="leading-none">
// //               <div className="text-[17px] font-extrabold tracking-tight text-[#0B3B82]">
// //                 THAARA THEERAM
// //               </div>

// //               <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
// //                 Clubs • People • Possibilities
// //               </div>
// //             </div>
// //           </Link>

// //           <nav className="hidden items-center gap-8 md:flex">
// //             <Link
// //               href="/clubs"
// //               className="text-sm font-medium text-slate-600 transition hover:text-[#0B3B82]"
// //             >
// //               Explore Clubs
// //             </Link>

// //             <a
// //               href="#about"
// //               className="text-sm font-medium text-slate-600 transition hover:text-[#0B3B82]"
// //             >
// //               About
// //             </a>

// //             <Link
// //               href="/requests/new"
// //               className="text-sm font-medium text-slate-600 transition hover:text-[#0B3B82]"
// //             >
// //               Start a Club
// //             </Link>
// //           </nav>

// //           {/* =================================================
// //               AUTH-AWARE NAVIGATION
// //           ================================================= */}

// //           {authLoading ? (
// //             <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
// //           ) : authenticated ? (
// //             <Link
// //               href="/dashboard"
// //               className="flex items-center gap-3 rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
// //             >
// //               <span className="hidden sm:inline">
// //                 {student?.name || 'Dashboard'}
// //               </span>

// //               <span className="sm:hidden">
// //                 Dashboard
// //               </span>

// //               <span>→</span>
// //             </Link>
// //           ) : (
// //             <Link
// //               href="/login"
// //               className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
// //             >
// //               Student Login
// //             </Link>
// //           )}
// //         </div>
// //       </header>

// //       {/* =====================================================
// //           HERO
// //       ===================================================== */}

// //       <section className="relative overflow-hidden">

// //         <div className="pointer-events-none absolute inset-0">
// //           <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#F5C542]/20 blur-3xl" />
// //           <div className="absolute -left-40 top-48 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />
// //         </div>

// //         <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 sm:px-8 md:pb-28 md:pt-28 lg:grid-cols-[1.05fr_.95fr]">

// //           <div>

// //             <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#F5C542]/40 bg-[#FFF9E7] px-4 py-2">
// //               <span className="h-2 w-2 rounded-full bg-[#F5C542]" />

// //               <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#725700]">
// //                 Pallavi Engineering College
// //               </span>
// //             </div>

// //             <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#092B5F] sm:text-6xl lg:text-7xl">
// //               Find your people.
// //               <br />

// //               <span className="text-[#F0B900]">
// //                 Follow your passion.
// //               </span>
// //             </h1>

// //             <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
// //               Thaara Theeram is a home for every passion — bringing
// //               together the clubs, people and possibilities that make
// //               college life more meaningful.
// //             </p>

// //             <div className="mt-9 flex flex-col gap-3 sm:flex-row">

// //               <a
// //                 href="#clubs"
// //                 className="inline-flex items-center justify-center rounded-2xl bg-[#0B3B82] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#082f69]"
// //               >
// //                 Explore clubs

// //                 <span className="ml-3 text-lg">
// //                   ↓
// //                 </span>
// //               </a>

// //               {authenticated ? (
// //                 <Link
// //                   href="/dashboard"
// //                   className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#0B3B82] hover:text-[#0B3B82]"
// //                 >
// //                   Go to dashboard
// //                 </Link>
// //               ) : (
// //                 <Link
// //                   href="/login"
// //                   className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#0B3B82] hover:text-[#0B3B82]"
// //                 >
// //                   Student login
// //                 </Link>
// //               )}

// //             </div>

// //             <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
// //               <span>Discover clubs</span>
// //               <span>•</span>
// //               <span>Meet people</span>
// //               <span>•</span>
// //               <span>Build something</span>
// //             </div>

// //           </div>

// //           {/* =================================================
// //               HERO CARD
// //           ================================================= */}

// //           <div className="relative mx-auto w-full max-w-xl">

// //             <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-950/10">

// //               <div className="overflow-hidden rounded-[1.5rem] bg-[#092B5F]">

// //                 <div className="p-7 sm:p-9">

// //                   <div className="flex items-center justify-between">

// //                     <div>
// //                       <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
// //                         Your campus
// //                       </div>

// //                       <div className="mt-2 text-2xl font-black text-white">
// //                         Your possibilities.
// //                       </div>
// //                     </div>

// //                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5C542] text-xl font-black text-[#092B5F]">
// //                       ✦
// //                     </div>

// //                   </div>

// //                   <div className="mt-8 grid grid-cols-2 gap-3">

// //                     <div className="rounded-2xl bg-white/10 p-5">
// //                       <div className="text-3xl font-black text-white">
// //                         {loadingClubs ? '—' : clubs.length}
// //                       </div>

// //                       <div className="mt-1 text-xs font-medium text-blue-200">
// //                         Active clubs
// //                       </div>
// //                     </div>

// //                     <div className="rounded-2xl bg-[#F5C542] p-5">
// //                       <div className="text-3xl font-black text-[#092B5F]">
// //                         ∞
// //                       </div>

// //                       <div className="mt-1 text-xs font-bold text-[#092B5F]/70">
// //                         Possibilities
// //                       </div>
// //                     </div>

// //                   </div>

// //                   <div className="mt-3 rounded-2xl bg-white p-5">

// //                     <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
// //                       {authenticated
// //                         ? `Welcome back, ${student?.name || 'student'}`
// //                         : 'Start here'}
// //                     </div>

// //                     <div className="mt-3 flex items-center justify-between">

// //                       <div>
// //                         <div className="font-bold text-slate-900">
// //                           {authenticated
// //                             ? 'Continue your journey'
// //                             : 'Explore a club'}
// //                         </div>

// //                         <div className="mt-1 text-xs text-slate-500">
// //                           {authenticated
// //                             ? 'Open your student dashboard.'
// //                             : 'Find something that feels like you.'}
// //                         </div>
// //                       </div>

// //                       <Link
// //                         href={
// //                           authenticated
// //                             ? '/dashboard'
// //                             : '/clubs'
// //                         }
// //                         className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0B3B82]"
// //                       >
// //                         →
// //                       </Link>

// //                     </div>

// //                   </div>

// //                 </div>

// //               </div>

// //             </div>

// //           </div>

// //         </div>
// //       </section>

// //       {/* =====================================================
// //     FEATURED CLUBS
// // ===================================================== */}

// // <section
// //   id="clubs"
// //   className="border-t border-slate-100 bg-[#F8FAFD]"
// // >
// //   <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">

// //     {/* Section heading */}

// //     <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

// //       <div>
// //         <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
// //           Discover
// //         </div>

// //         <h2 className="mt-3 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
// //           Find your space.
// //         </h2>

// //         <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
// //           A few communities to get you started. Explore what interests
// //           you, meet your people and find where you belong.
// //         </p>
// //       </div>


// //       {/* View all clubs */}

// //       <Link
// //         href="/clubs"
// //         className="inline-flex shrink-0 items-center self-start rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B3B82] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 md:self-auto"
// //       >
// //         View all clubs
// //         <span className="ml-3 text-base">
// //           →
// //         </span>
// //       </Link>

// //     </div>


// //     {/* Featured clubs */}

// //     <div className="mt-10">

// //       {loadingClubs ? (

// //         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

// //           {[1, 2, 3, 4, 5].map((item) => (
// //             <div
// //               key={item}
// //               className="h-64 animate-pulse rounded-3xl bg-slate-200"
// //             />
// //           ))}

// //         </div>

// //       ) : clubs.length === 0 ? (

// //         <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

// //           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#0B3B82]">
// //             ✦
// //           </div>

// //           <h3 className="mt-5 text-lg font-black text-slate-900">
// //             Clubs are coming soon.
// //           </h3>

// //           <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
// //             The club directory is being prepared. Check back soon
// //             to discover the communities around campus.
// //           </p>

// //           <Link
// //             href="/clubs"
// //             className="mt-6 inline-flex items-center rounded-xl bg-[#0B3B82] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#082f69]"
// //           >
// //             Explore all clubs
// //             <span className="ml-3">
// //               →
// //             </span>
// //           </Link>

// //         </div>

// //       ) : (

// //         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

// //           {clubs.slice(0, 5).map((club) => (

// //             <Link
// //               key={club.id}
// //               href={`/clubs/${club.slug}`}
// //               className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"
// //             >

// //               {/* Club visual */}

// //               <div className="relative h-36 overflow-hidden bg-[#092B5F]">

// //                 {club.logo_url ? (

// //                   <img
// //                     src={club.logo_url}
// //                     alt={`${club.name} logo`}
// //                     className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
// //                   />

// //                 ) : (

// //                   <div className="flex h-full items-center justify-center">

// //                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black text-[#F5C542]">
// //                       {categoryIcons[club.category || 'Other'] || '•'}
// //                     </div>

// //                   </div>

// //                 )}

// //                 <div className="absolute inset-0 bg-gradient-to-t from-[#092B5F] via-transparent to-transparent" />

// //                 <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">

// //                   <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3B82]">
// //                     {club.category || 'Club'}
// //                   </span>

// //                   <span className="text-xl font-bold text-white opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100">
// //                     →
// //                   </span>

// //                 </div>

// //               </div>


// //               {/* Club information */}

// //               <div className="p-6">

// //                 <h3 className="text-xl font-black tracking-tight text-slate-900">
// //                   {club.name}
// //                 </h3>

// //                 <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
// //                   {club.short_description ||
// //                     club.description ||
// //                     'Discover this club and see what they are building.'}
// //                 </p>

// //                 <div className="mt-5 flex items-center text-xs font-bold text-[#0B3B82]">
// //                   Explore club

// //                   <span className="ml-2 transition group-hover:translate-x-1">
// //                     →
// //                   </span>
// //                 </div>

// //               </div>

// //             </Link>

// //           ))}

// //         </div>

// //       )}

// //     </div>


// //     {/* Bottom directory CTA */}

// //     {!loadingClubs && clubs.length > 5 && (
// //       <div className="mt-10 flex justify-center">

// //         <Link
// //           href="/clubs"
// //           className="inline-flex items-center rounded-2xl bg-[#0B3B82] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#082f69]"
// //         >
// //           Explore all {clubs.length} clubs

// //           <span className="ml-3 text-lg">
// //             →
// //           </span>
// //         </Link>

// //       </div>
// //     )}

// //   </div>
// // </section>

// //       {/* =====================================================
// //           HOW IT WORKS
// //       ===================================================== */}

// //       <section
// //         id="about"
// //         className="bg-white"
// //       >

// //         <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">

// //           <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">

// //             <div>

// //               <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
// //                 How it works
// //               </div>

// //               <h2 className="mt-3 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
// //                 One student.
// //                 <br />
// //                 Many possibilities.
// //               </h2>

// //               <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
// //                 One student account connects your club memberships,
// //                 responsibilities and participation across Thaara
// //                 Theeram.
// //               </p>

// //             </div>

// //             <div className="grid gap-4 sm:grid-cols-2">

// //               <Feature
// //                 number="01"
// //                 title="Discover"
// //                 description="Explore club pages, understand what they do and find a community that matches your interests."
// //               />

// //               <Feature
// //                 number="02"
// //                 title="Join"
// //                 description="Apply to become part of a club while keeping everything connected to your student identity."
// //               />

// //               <Feature
// //                 number="03"
// //                 title="Participate"
// //                 description="Stay connected with your clubs, announcements, activities and community."
// //               />

// //               <Feature
// //                 number="04"
// //                 title="Lead"
// //                 description="Take responsibility as a Coordinator or Head and help your club grow."
// //               />

// //             </div>

// //           </div>

// //         </div>

// //       </section>

// //       {/* =====================================================
// //           START A CLUB CTA
// //       ===================================================== */}

// //       <section className="px-5 pb-20 sm:px-8 md:pb-24">

// //         <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#092B5F]">

// //           <div className="relative px-7 py-14 text-center sm:px-12 sm:py-16">

// //             <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#F5C542]/15 blur-3xl" />

// //             <div className="relative">

// //               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5C542] text-xl font-black text-[#092B5F]">
// //                 ✦
// //               </div>

// //               <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
// //                 Have an idea for a club?
// //               </h2>

// //               <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
// //                 Think something is missing from campus? Submit a club
// //                 request and tell us what you want to build.
// //               </p>

// //               <div className="mt-8">

// //                 <Link
// //                   href="/requests/new"
// //                   className="inline-flex rounded-xl bg-[#F5C542] px-6 py-3.5 text-sm font-black text-[#092B5F] transition hover:bg-[#ffd65f]"
// //                 >
// //                   Start a club request
// //                   <span className="ml-3">
// //                     →
// //                   </span>
// //                 </Link>

// //               </div>

// //             </div>

// //           </div>

// //         </div>

// //       </section>

// //       {/* =====================================================
// //           FOOTER
// //       ===================================================== */}

// //       <footer className="border-t border-slate-200 bg-[#F8FAFD]">

// //         <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">

// //           <div className="grid gap-10 md:grid-cols-[1.4fr_.8fr_.8fr]">

// //             <div>

// //               <div className="flex items-center gap-3">

// //                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B82] font-black text-white">
// //                   T
// //                 </div>

// //                 <div>

// //                   <div className="font-black tracking-tight text-[#0B3B82]">
// //                     THAARA THEERAM
// //                   </div>

// //                   <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
// //                     A home for every passion
// //                   </div>

// //                 </div>

// //               </div>

// //               <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
// //                 The student club ecosystem of Pallavi Engineering
// //                 College — connecting clubs, people and possibilities.
// //               </p>

// //             </div>

// //             <div>

// //               <div className="text-xs font-black uppercase tracking-wider text-slate-400">
// //                 Explore
// //               </div>

// //               <div className="mt-4 space-y-3 text-sm">

// //                 <Link
// //                   href="/clubs"
// //                   className="block text-slate-600 hover:text-[#0B3B82]"
// //                 >
// //                   Clubs
// //                 </Link>

// //                 {authenticated ? (
// //                   <Link
// //                     href="/dashboard"
// //                     className="block text-slate-600 hover:text-[#0B3B82]"
// //                   >
// //                     Dashboard
// //                   </Link>
// //                 ) : (
// //                   <Link
// //                     href="/login"
// //                     className="block text-slate-600 hover:text-[#0B3B82]"
// //                   >
// //                     Student Login
// //                   </Link>
// //                 )}

// //                 <Link
// //                   href="/requests/new"
// //                   className="block text-slate-600 hover:text-[#0B3B82]"
// //                 >
// //                   Request a Club
// //                 </Link>

// //               </div>

// //             </div>

// //             <div>

// //               <div className="text-xs font-black uppercase tracking-wider text-slate-400">
// //                 College
// //               </div>

// //               <div className="mt-4 text-sm leading-6 text-slate-500">

// //                 <div className="font-semibold text-slate-700">
// //                   Pallavi Engineering College
// //                 </div>

// //                 <div className="mt-2">
// //                   Kuntloor, Hayathnagar
// //                   <br />
// //                   Hyderabad, Telangana
// //                 </div>

// //               </div>

// //             </div>

// //           </div>

// //           <div className="mt-10 flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">

// //             <div>
// //               © 2026 Thaara Theeram. All rights reserved.
// //             </div>

// //             <div>
// //               Clubs • People • Possibilities
// //             </div>

// //           </div>

// //         </div>

// //       </footer>

// //     </main>
// //   )
// // }

// // /* ===============================================================
// //    FEATURE
// // =============================================================== */

// // function Feature({
// //   number,
// //   title,
// //   description,
// // }: {
// //   number: string
// //   title: string
// //   description: string
// // }) {
// //   return (
// //     <div className="rounded-3xl border border-slate-200 bg-[#F8FAFD] p-6 transition hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-950/5">

// //       <div className="flex items-center justify-between">

// //         <span className="text-xs font-black tracking-widest text-[#F0B900]">
// //           {number}
// //         </span>

// //         <span className="text-lg font-bold text-[#0B3B82]">
// //           →
// //         </span>

// //       </div>

// //       <h3 className="mt-8 text-lg font-black text-slate-900">
// //         {title}
// //       </h3>

// //       <p className="mt-2 text-sm leading-6 text-slate-500">
// //         {description}
// //       </p>

// //     </div>
// //   )
// // }


// 'use client'

// import Link from 'next/link'
// import { useEffect, useState } from 'react'
// import { createClient } from '@/lib/supabase/client'

// type Club = {
//   id: string
//   name: string
//   slug: string
//   category: string | null
//   short_description: string | null
//   description: string | null
//   logo_url: string | null
// }

// type Student = {
//   id: string
//   roll_number: string
//   name: string
//   department: string
//   year: string
//   section: string
// }

// type AuthMeResponse = {
//   authenticated: boolean
//   student?: Student
//   isAdmin?: boolean
//   memberships?: Array<{
//     club_id: string
//     role: string
//     status: string
//     clubs: {
//       id: string
//       name: string
//       slug: string
//     } | null
//   }>
// }

// export default function HomePage() {
//   const [clubs, setClubs] = useState<Club[]>([])
//   const [loadingClubs, setLoadingClubs] = useState(true)
//   const [clubsError, setClubsError] = useState(false)

//   const [authLoading, setAuthLoading] = useState(true)
//   const [authenticated, setAuthenticated] = useState(false)
//   const [student, setStudent] = useState<Student | null>(null)
//   const [isAdmin, setIsAdmin] = useState(false)

//   useEffect(() => {
//     loadHomeData()
//   }, [])

//   async function loadHomeData() {
//     const supabase = createClient()

//     setLoadingClubs(true)
//     setClubsError(false)

//     const { data: clubsData, error: clubsError } = await supabase
//       .from('clubs')
//       .select(`
//         id,
//         name,
//         slug,
//         category,
//         short_description,
//         description,
//         logo_url
//       `)
//       .eq('status', 'ACTIVE')
//       .order('name', { ascending: true })

//     if (clubsError) {
//       console.error('Could not load clubs:', clubsError)
//       setClubsError(true)
//       setClubs([])
//     } else if (clubsData) {
//       setClubs(clubsData)
//     }

//     setLoadingClubs(false)

//     try {
//       const response = await fetch('/api/auth/me', {
//         method: 'GET',
//         credentials: 'include',
//         cache: 'no-store',
//       })

//       if (response.ok) {
//         const data: AuthMeResponse = await response.json()

//         if (data.authenticated && data.student) {
//           setAuthenticated(true)
//           setStudent(data.student)
//           setIsAdmin(!!data.isAdmin)
//         }
//       }
//     } catch (error) {
//       console.error('Could not load session:', error)
//     } finally {
//       setAuthLoading(false)
//     }
//   }

//   return (
//     <main className="min-h-screen overflow-x-hidden bg-white text-[#092B5F]">

//       <HomeHeader
//         authenticated={authenticated}
//         authLoading={authLoading}
//         student={student}
//       />

//       {/* =========================================================
//           HERO
//       ========================================================= */}

//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 pointer-events-none">
//           <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#F5C542]/10 blur-3xl" />
//           <div className="absolute -left-48 top-[360px] h-[420px] w-[420px] rounded-full bg-blue-50 blur-3xl" />
//         </div>

//         <div className="relative mx-auto grid max-w-[1280px] items-center gap-16 px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">

//           {/* Hero copy */}

//           <div>
//             <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#F5C542]/40 bg-[#FFF9E7] px-4 py-2">
//               <span className="h-2 w-2 rounded-full bg-[#F5C542]" />

//               <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#725700]">
//                 Pallavi Engineering College
//               </span>
//             </div>

//             <h1 className="max-w-[780px] text-[clamp(3.25rem,6vw,5.75rem)] font-black leading-[0.94] tracking-[-0.055em] text-[#092B5F]">
//               Find your people.
//               <br />

//               <span className="text-[#0B3B82]">
//                 Follow your passion.
//               </span>
//             </h1>

//             <p className="mt-8 max-w-[620px] text-[17px] leading-8 text-[#475569] sm:text-[19px]">
//               A home for every passion — discover clubs, meet people who
//               share your interests, and turn your college experience into
//               something meaningful.
//             </p>

//             <div className="mt-9 flex flex-col gap-3 sm:flex-row">
//               <Link
//                 href="/clubs"
//                 className="group inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(11,59,130,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#092F69] focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
//               >
//                 Explore clubs

//                 <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
//               </Link>

//               <Link
//                 href="/requests/new"
//                 className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-sm font-bold text-[#0B3B82] transition duration-200 hover:border-[#0B3B82] hover:bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
//               >
//                 Start a club
//               </Link>
//             </div>

//             <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#64748B]">
//               <span>Discover</span>
//               <span className="text-[#CBD5E1]">/</span>
//               <span>Connect</span>
//               <span className="text-[#CBD5E1]">/</span>
//               <span>Create</span>
//               <span className="text-[#CBD5E1]">/</span>
//               <span>Lead</span>
//             </div>
//           </div>

//           {/* Hero visual */}

//           <div className="relative mx-auto w-full max-w-[560px]">
//             <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-50/60 blur-2xl" />

//             <div className="relative rounded-[2rem] border border-[#E2E8F0] bg-white p-2 shadow-[0_30px_80px_rgba(9,43,95,0.12)]">

//               <div className="overflow-hidden rounded-[1.55rem] bg-[#092B5F]">

//                 <div className="relative min-h-[430px] p-7 sm:p-9">

//                   {/* Decorative grid */}

//                   <div
//                     className="pointer-events-none absolute inset-0 opacity-[0.08]"
//                     style={{
//                       backgroundImage:
//                         'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
//                       backgroundSize: '36px 36px',
//                     }}
//                   />

//                   <div className="relative">

//                     <div className="flex items-start justify-between">
//                       <div>
//                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
//                           THAARA THEERAM
//                         </p>

//                         <h2 className="mt-3 max-w-[300px] text-3xl font-black leading-tight tracking-[-0.03em] text-white sm:text-4xl">
//                           Your interests
//                           <br />
//                           have a place.
//                         </h2>
//                       </div>

//                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5C542]">
//                         <Sparkle className="h-5 w-5 text-[#092B5F]" />
//                       </div>
//                     </div>

//                     {/* Stats */}

//                     <div className="mt-10 grid grid-cols-2 gap-3">

//                       <div className="rounded-2xl bg-white/[0.08] p-5">
//                         <p className="text-3xl font-black tracking-tight text-white">
//                           {loadingClubs ? '—' : clubs.length}
//                         </p>

//                         <p className="mt-1 text-xs font-medium text-blue-200">
//                           Active clubs
//                         </p>
//                       </div>

//                       <div className="rounded-2xl bg-[#F5C542] p-5">
//                         <p className="text-3xl font-black tracking-tight text-[#092B5F]">
//                           ∞
//                         </p>

//                         <p className="mt-1 text-xs font-bold text-[#092B5F]/70">
//                           Possibilities
//                         </p>
//                       </div>

//                     </div>

//                     {/* Journey panel */}

//                     <div className="mt-3 rounded-2xl bg-white p-5">

//                       <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
//                         {authenticated
//                           ? `Welcome back, ${student?.name || 'student'}`
//                           : 'Your journey starts here'}
//                       </p>

//                       <div className="mt-4 flex items-center justify-between gap-4">

//                         <div>
//                           <h3 className="text-sm font-bold text-[#0F172A]">
//                             {authenticated
//                               ? 'Continue exploring'
//                               : 'Find something that feels like you'}
//                           </h3>

//                           <p className="mt-1 text-xs leading-5 text-[#64748B]">
//                             {authenticated
//                               ? 'Open your dashboard and see what needs your attention.'
//                               : 'Browse campus communities and discover where you belong.'}
//                           </p>
//                         </div>

//                         <Link
//                           href={authenticated ? '/dashboard' : '/clubs'}
//                           aria-label={
//                             authenticated
//                               ? 'Open dashboard'
//                               : 'Explore clubs'
//                           }
//                           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B3B82] transition hover:bg-blue-100"
//                         >
//                           <ArrowUpRight className="h-4 w-4" />
//                         </Link>

//                       </div>
//                     </div>

//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Floating detail */}

//             <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-xl shadow-blue-950/10 sm:block lg:-left-8">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5C542]/20">
//                   <Users className="h-4 w-4 text-[#0B3B82]" />
//                 </div>

//                 <div>
//                   <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
//                     Campus
//                   </p>

//                   <p className="mt-0.5 text-xs font-bold text-[#092B5F]">
//                     Clubs • People • Possibilities
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </section>

//       {/* =========================================================
//           CLUB DISCOVERY
//       ========================================================= */}

//       <section
//         id="clubs"
//         className="border-y border-[#E2E8F0]/70 bg-[#F8FAFD]"
//       >
//         <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 md:py-24">

//           <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">

//             <div>
//               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
//                 Discover
//               </p>

//               <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#092B5F] sm:text-4xl">
//                 Find your space.
//               </h2>

//               <p className="mt-4 max-w-[600px] text-sm leading-7 text-[#64748B] sm:text-base">
//                 Explore the communities shaping campus life. Find something
//                 that interests you, or discover something completely new.
//               </p>
//             </div>

//             <Link
//               href="/clubs"
//               className="group inline-flex min-h-11 shrink-0 items-center self-start rounded-xl border border-[#CBD5E1] bg-white px-5 text-sm font-bold text-[#0B3B82] transition hover:border-[#0B3B82] hover:bg-blue-50 md:self-auto"
//             >
//               View all clubs

//               <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>

//           </div>

//           <div className="mt-11">

//             {loadingClubs ? (
//               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//                 {[1, 2, 3, 4, 5].map((item) => (
//                   <ClubSkeleton key={item} />
//                 ))}
//               </div>
//             ) : clubsError ? (
//               <div className="rounded-3xl border border-[#E2E8F0] bg-white px-6 py-16 text-center">
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
//                   <AlertCircle className="h-5 w-5 text-red-500" />
//                 </div>

//                 <h3 className="mt-5 text-lg font-black text-[#0F172A]">
//                   We couldn't load the clubs.
//                 </h3>

//                 <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
//                   Something went wrong while loading the club directory.
//                   Please try again.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={loadHomeData}
//                   className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#0B3B82] px-5 text-sm font-bold text-white transition hover:bg-[#092F69] focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
//                 >
//                   Try again
//                 </button>
//               </div>
//             ) : clubs.length === 0 ? (
//               <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center">
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
//                   <Compass className="h-5 w-5 text-[#0B3B82]" />
//                 </div>

//                 <h3 className="mt-5 text-lg font-black text-[#0F172A]">
//                   Your club directory is taking shape.
//                 </h3>

//                 <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
//                   There aren't any active clubs available yet. Check back
//                   soon as more communities come to life.
//                 </p>

//                 <Link
//                   href="/requests/new"
//                   className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#0B3B82] px-5 text-sm font-bold text-white transition hover:bg-[#092F69]"
//                 >
//                   Start a club
//                   <ArrowRight className="ml-3 h-4 w-4" />
//                 </Link>
//               </div>
//             ) : (
//               <>
//                 <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//                   {clubs.slice(0, 5).map((club) => (
//                     <ClubCard key={club.id} club={club} />
//                   ))}
//                 </div>

//                 {clubs.length > 5 && (
//                   <div className="mt-10 text-center">
//                     <Link
//                       href="/clubs"
//                       className="group inline-flex min-h-11 items-center rounded-xl bg-[#0B3B82] px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#092F69]"
//                     >
//                       Explore all {clubs.length} clubs

//                       <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
//                     </Link>
//                   </div>
//                 )}
//               </>
//             )}

//           </div>
//         </div>
//       </section>

//       {/* =========================================================
//           HOW IT WORKS
//       ========================================================= */}

//       <section id="about" className="bg-white">
//         <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 md:py-28">

//           <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

//             <div>
//               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
//                 Possibilities
//               </p>

//               <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-[#092B5F] sm:text-4xl">
//                 One student.
//                 <br />
//                 Many possibilities.
//               </h2>

//               <p className="mt-5 max-w-[430px] text-sm leading-7 text-[#64748B] sm:text-base">
//                 Your interests don't have to stay interests. Discover
//                 communities, become part of them, contribute, and eventually
//                 help shape them.
//               </p>
//             </div>

//             <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
//               <Feature
//                 number="01"
//                 title="Discover"
//                 description="Explore clubs, understand what they do, and find communities that match your interests."
//               />

//               <Feature
//                 number="02"
//                 title="Join"
//                 description="Apply to become part of a club while keeping your participation connected to your student identity."
//               />

//               <Feature
//                 number="03"
//                 title="Participate"
//                 description="Stay connected with announcements, activities, people, and everything happening across your clubs."
//               />

//               <Feature
//                 number="04"
//                 title="Lead"
//                 description="Take responsibility as a Coordinator or Head and help your community grow."
//               />
//             </div>

//           </div>
//         </div>
//       </section>

//       {/* =========================================================
//           START SOMETHING
//       ========================================================= */}

//       <section className="px-5 pb-20 sm:px-8 md:pb-28">
//         <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[#092B5F]">

//           <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#F5C542]/10 blur-3xl" />
//           <div className="pointer-events-none absolute -bottom-40 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

//           <div className="relative px-7 py-16 sm:px-12 sm:py-20 lg:px-20">

//             <div className="max-w-[720px]">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5C542]">
//                 <Plus className="h-5 w-5 text-[#092B5F]" />
//               </div>

//               <p className="mt-7 text-[11px] font-black uppercase tracking-[0.2em] text-[#F5C542]">
//                 Start something
//               </p>

//               <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
//                 Don't see your community?
//               </h2>

//               <p className="mt-5 max-w-[620px] text-sm leading-7 text-blue-100 sm:text-base">
//                 Maybe it hasn't been created yet. Bring your idea to campus,
//                 gather people around it, and start something meaningful.
//               </p>

//               <Link
//                 href="/requests/new"
//                 className="group mt-8 inline-flex min-h-12 items-center rounded-xl bg-[#F5C542] px-6 text-sm font-black text-[#092B5F] transition hover:-translate-y-0.5 hover:bg-[#FFD65F]"
//               >
//                 Start a club request

//                 <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
//               </Link>

//             </div>
//           </div>
//         </div>
//       </section>

//       <HomeFooter authenticated={authenticated} />
//     </main>
//   )
// }

// /* ===============================================================
//    HEADER
// =============================================================== */

// function HomeHeader({
//   authenticated,
//   authLoading,
//   student,
// }: {
//   authenticated: boolean
//   authLoading: boolean
//   student: Student | null
// }) {
//   const [menuOpen, setMenuOpen] = useState(false)

//   return (
//     <header className="sticky top-0 z-50 border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur-xl">

//       <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">

//         <Link
//           href="/"
//           className="group flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
//         >
//           <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0B3B82]">
//             <img
//               src="/brand/thaara-mark.png"
//               alt=""
//               className="h-7 w-7 object-contain"
//             />
//           </div>

//           <div className="hidden leading-none sm:block">
//             <div className="text-[16px] font-black tracking-[-0.02em] text-[#0B3B82]">
//               THAARA THEERAM
//             </div>

//             <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
//               Clubs • People • Possibilities
//             </div>
//           </div>
//         </Link>

//         <nav className="hidden items-center gap-7 md:flex">
//           <Link
//             href="/clubs"
//             className="text-sm font-semibold text-[#475569] transition hover:text-[#0B3B82]"
//           >
//             Explore Clubs
//           </Link>

//           <a
//             href="#about"
//             className="text-sm font-semibold text-[#475569] transition hover:text-[#0B3B82]"
//           >
//             About
//           </a>

//           <Link
//             href="/requests/new"
//             className="text-sm font-semibold text-[#475569] transition hover:text-[#0B3B82]"
//           >
//             Start a Club
//           </Link>
//         </nav>

//         <div className="hidden md:block">
//           {authLoading ? (
//             <div className="h-10 w-28 animate-pulse rounded-xl bg-[#F1F5F9]" />
//           ) : authenticated ? (
//             <Link
//               href="/dashboard"
//               className="group inline-flex min-h-10 items-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition hover:bg-[#092F69]"
//             >
//               <span className="max-w-[130px] truncate">
//                 {student?.name || 'Dashboard'}
//               </span>

//               <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>
//           ) : (
//             <Link
//               href="/login"
//               className="inline-flex min-h-10 items-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition hover:bg-[#092F69]"
//             >
//               Student Login
//             </Link>
//           )}
//         </div>

//         <button
//           type="button"
//           aria-label={menuOpen ? 'Close menu' : 'Open menu'}
//           aria-expanded={menuOpen}
//           onClick={() => setMenuOpen((value) => !value)}
//           className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#0B3B82] transition hover:bg-[#F8FAFD] md:hidden"
//         >
//           {menuOpen ? (
//             <X className="h-5 w-5" />
//           ) : (
//             <Menu className="h-5 w-5" />
//           )}
//         </button>
//       </div>

//       {menuOpen && (
//         <div className="border-t border-[#E2E8F0] bg-white px-5 py-5 md:hidden">
//           <nav className="mx-auto max-w-[1280px] space-y-1">

//             <Link
//               href="/clubs"
//               onClick={() => setMenuOpen(false)}
//               className="flex min-h-12 items-center rounded-xl px-3 text-sm font-bold text-[#334155] hover:bg-[#F8FAFD] hover:text-[#0B3B82]"
//             >
//               Explore Clubs
//             </Link>

//             <a
//               href="#about"
//               onClick={() => setMenuOpen(false)}
//               className="flex min-h-12 items-center rounded-xl px-3 text-sm font-bold text-[#334155] hover:bg-[#F8FAFD] hover:text-[#0B3B82]"
//             >
//               About
//             </a>

//             <Link
//               href="/requests/new"
//               onClick={() => setMenuOpen(false)}
//               className="flex min-h-12 items-center rounded-xl px-3 text-sm font-bold text-[#334155] hover:bg-[#F8FAFD] hover:text-[#0B3B82]"
//             >
//               Start a Club
//             </Link>

//             <div className="pt-3">
//               {authenticated ? (
//                 <Link
//                   href="/dashboard"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white"
//                 >
//                   Open Dashboard
//                 </Link>
//               ) : (
//                 <Link
//                   href="/login"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white"
//                 >
//                   Student Login
//                 </Link>
//               )}
//             </div>

//           </nav>
//         </div>
//       )}
//     </header>
//   )
// }

// /* ===============================================================
//    CLUB CARD
// =============================================================== */

// function ClubCard({ club }: { club: Club }) {
//   return (
//     <Link
//       href={`/clubs/${club.slug}`}
//       className="group block overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(9,43,95,0.08)] focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
//     >
//       <div className="relative h-40 overflow-hidden bg-[#092B5F]">

//         {club.logo_url ? (
//           <img
//             src={club.logo_url}
//             alt={`${club.name} logo`}
//             className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
//           />
//         ) : (
//           <div className="flex h-full items-center justify-center">
//             <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
//               <span className="text-2xl font-black text-[#F5C542]">
//                 {getClubInitials(club.name)}
//               </span>
//             </div>
//           </div>
//         )}

//         <div className="absolute inset-0 bg-gradient-to-t from-[#092B5F] via-[#092B5F]/10 to-transparent" />

//         <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3">

//           <span className="max-w-[75%] truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3B82]">
//             {club.category || 'Club'}
//           </span>

//           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition group-hover:bg-[#F5C542] group-hover:text-[#092B5F]">
//             <ArrowUpRight className="h-4 w-4" />
//           </div>

//         </div>
//       </div>

//       <div className="p-6">

//         <h3 className="text-xl font-black tracking-[-0.025em] text-[#0F172A]">
//           {club.name}
//         </h3>

//         <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">
//           {club.short_description ||
//             club.description ||
//             'Discover this club and see what they are building.'}
//         </p>

//         <div className="mt-5 flex items-center text-xs font-bold text-[#0B3B82]">
//           Explore club

//           <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
//         </div>

//       </div>
//     </Link>
//   )
// }

// /* ===============================================================
//    FEATURE
// =============================================================== */

// function Feature({
//   number,
//   title,
//   description,
// }: {
//   number: string
//   title: string
//   description: string
// }) {
//   return (
//     <div className="border-t border-[#E2E8F0] pt-5">

//       <div className="flex items-center justify-between">
//         <span className="text-[11px] font-black tracking-[0.18em] text-[#F0B900]">
//           {number}
//         </span>

//         <ArrowUpRight className="h-4 w-4 text-[#0B3B82]" />
//       </div>

//       <h3 className="mt-7 text-xl font-black tracking-[-0.025em] text-[#0F172A]">
//         {title}
//       </h3>

//       <p className="mt-2 text-sm leading-6 text-[#64748B]">
//         {description}
//       </p>
//     </div>
//   )
// }

// /* ===============================================================
//    SKELETON
// =============================================================== */

// function ClubSkeleton() {
//   return (
//     <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white">
//       <div className="h-40 animate-pulse bg-[#E2E8F0]" />

//       <div className="space-y-3 p-6">
//         <div className="h-5 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
//         <div className="h-4 w-full animate-pulse rounded bg-[#F1F5F9]" />
//         <div className="h-4 w-4/5 animate-pulse rounded bg-[#F1F5F9]" />
//       </div>
//     </div>
//   )
// }

// /* ===============================================================
//    FOOTER
// =============================================================== */

// function HomeFooter({
//   authenticated,
// }: {
//   authenticated: boolean
// }) {
//   return (
//     <footer className="border-t border-[#E2E8F0] bg-[#F8FAFD]">

//       <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">

//         <div className="grid gap-10 md:grid-cols-[1.5fr_.7fr_.8fr]">

//           <div>
//             <Link
//               href="/"
//               className="inline-flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
//             >
//               <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0B3B82]">
//                 <img
//                   src="/brand/thaara-mark.png"
//                   alt=""
//                   className="h-7 w-7 object-contain"
//                 />
//               </div>

//               <div>
//                 <div className="font-black tracking-[-0.02em] text-[#0B3B82]">
//                   THAARA THEERAM
//                 </div>

//                 <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
//                   A home for every passion
//                 </div>
//               </div>
//             </Link>

//             <p className="mt-5 max-w-[440px] text-sm leading-6 text-[#64748B]">
//               The student club ecosystem of Pallavi Engineering College —
//               connecting clubs, people and possibilities.
//             </p>
//           </div>

//           <div>
//             <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
//               Explore
//             </p>

//             <div className="mt-4 space-y-3 text-sm">
//               <Link
//                 href="/clubs"
//                 className="block font-medium text-[#475569] hover:text-[#0B3B82]"
//               >
//                 Clubs
//               </Link>

//               {authenticated ? (
//                 <Link
//                   href="/dashboard"
//                   className="block font-medium text-[#475569] hover:text-[#0B3B82]"
//                 >
//                   Dashboard
//                 </Link>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="block font-medium text-[#475569] hover:text-[#0B3B82]"
//                 >
//                   Student Login
//                 </Link>
//               )}

//               <Link
//                 href="/requests/new"
//                 className="block font-medium text-[#475569] hover:text-[#0B3B82]"
//               >
//                 Start a Club
//               </Link>
//             </div>
//           </div>

//           <div>
//             <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
//               Campus
//             </p>

//             <div className="mt-4 text-sm leading-6 text-[#64748B]">
//               <p className="font-semibold text-[#334155]">
//                 Pallavi Engineering College
//               </p>

//               <p className="mt-2">
//                 Kuntloor, Hayathnagar
//                 <br />
//                 Hyderabad, Telangana
//               </p>
//             </div>
//           </div>

//         </div>

//         <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#E2E8F0] pt-6 text-xs text-[#94A3B8] sm:flex-row">
//           <span>
//             © 2026 Thaara Theeram. All rights reserved.
//           </span>

//           <span>
//             Clubs • People • Possibilities
//           </span>
//         </div>

//       </div>
//     </footer>
//   )
// }

// /* ===============================================================
//    ICONS
// =============================================================== */

// function ArrowRight({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M4 10h11" />
//       <path d="m11 5 5 5-5 5" />
//     </svg>
//   )
// }

// function ArrowUpRight({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M5 15 15 5" />
//       <path d="M7 5h8v8" />
//     </svg>
//   )
// }

// function Sparkle({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.7"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="m10 2 1.5 5.5L17 10l-5.5 1.5L10 17l-1.5-5.5L3 10l5.5-2.5L10 2Z" />
//     </svg>
//   )
// }

// function Users({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.7"
//       className={className}
//       aria-hidden="true"
//     >
//       <circle cx="7" cy="7" r="3" />
//       <path d="M2.5 17c.4-3 2-4.5 4.5-4.5S11.1 14 11.5 17" />
//       <path d="M13 4.5a3 3 0 0 1 0 5.8" />
//       <path d="M14 12.7c2 .3 3.2 1.7 3.5 4.3" />
//     </svg>
//   )
// }

// function Plus({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M10 4v12M4 10h12" />
//     </svg>
//   )
// }

// function Menu({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M3 5h14M3 10h14M3 15h14" />
//     </svg>
//   )
// }

// function X({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="m5 5 10 10M15 5 5 15" />
//     </svg>
//   )
// }

// function Compass({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.6"
//       className={className}
//       aria-hidden="true"
//     >
//       <circle cx="10" cy="10" r="7.5" />
//       <path d="m12.8 7.2-1.7 3.9-3.9 1.7 1.7-3.9 3.9-1.7Z" />
//     </svg>
//   )
// }

// function AlertCircle({ className = '' }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 20 20"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.7"
//       className={className}
//       aria-hidden="true"
//     >
//       <circle cx="10" cy="10" r="7.5" />
//       <path d="M10 6v4.5M10 13.5v.5" />
//     </svg>
//   )
// }

// function getClubInitials(name: string) {
//   const words = name.trim().split(/\s+/).filter(Boolean)

//   if (words.length === 1) {
//     return words[0].slice(0, 2).toUpperCase()
//   }

//   return `${words[0][0]}${words[1][0]}`.toUpperCase()
// }


'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Club = {
  id: string
  name: string
  slug: string
  category: string | null
  short_description: string | null
  description: string | null
  logo_url: string | null
}

type Student = {
  id: string
  roll_number: string
  name: string
  department: string
  year: string
  section: string
}

type AuthMeResponse = {
  authenticated: boolean
  student?: Student
  isAdmin?: boolean
  memberships?: Array<{
    club_id: string
    role: string
    status: string
    clubs: {
      id: string
      name: string
      slug: string
    } | null
  }>
}

export default function HomePage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [clubsError, setClubsError] = useState(false)

  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    loadHomeData()
  }, [])

  async function loadHomeData() {
    const supabase = createClient()

    setLoadingClubs(true)
    setClubsError(false)

    const { data: clubsData, error: clubsError } = await supabase
      .from('clubs')
      .select(`
        id,
        name,
        slug,
        category,
        short_description,
        description,
        logo_url
      `)
      .eq('status', 'ACTIVE')
      .order('name', { ascending: true })

    if (clubsError) {
      console.error('Could not load clubs:', clubsError)
      setClubs([])
      setClubsError(true)
    } else if (clubsData) {
      setClubs(clubsData)
    }

    setLoadingClubs(false)

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      if (response.ok) {
        const data: AuthMeResponse = await response.json()

        if (data.authenticated && data.student) {
          setAuthenticated(true)
          setStudent(data.student)
        }
      }
    } catch (error) {
      console.error('Could not load session:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes tt-hero-fade {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tt-hero-image {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.975);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes tt-ambient {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(10px, -8px, 0) scale(1.04);
          }
        }

        @keyframes tt-grid {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(36px, 36px, 0);
          }
        }

        @keyframes tt-scroll-cue {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.55;
          }

          50% {
            transform: translateY(4px);
            opacity: 1;
          }
        }

        .tt-hero-1 {
          opacity: 0;
          animation: tt-hero-fade 700ms cubic-bezier(0.22, 1, 0.36, 1)
            100ms forwards;
        }

        .tt-hero-2 {
          opacity: 0;
          animation: tt-hero-fade 800ms cubic-bezier(0.22, 1, 0.36, 1)
            180ms forwards;
        }

        .tt-hero-3 {
          opacity: 0;
          animation: tt-hero-fade 700ms cubic-bezier(0.22, 1, 0.36, 1)
            320ms forwards;
        }

        .tt-hero-4 {
          opacity: 0;
          animation: tt-hero-fade 700ms cubic-bezier(0.22, 1, 0.36, 1)
            420ms forwards;
        }

        .tt-hero-visual {
          opacity: 0;
          animation: tt-hero-image 900ms cubic-bezier(0.22, 1, 0.36, 1)
            260ms forwards;
        }

        .tt-ambient {
          animation: tt-ambient 9s ease-in-out infinite;
        }

        .tt-grid {
          animation: tt-grid 24s linear infinite;
        }

        .tt-scroll-cue {
          animation: tt-scroll-cue 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .tt-hero-1,
          .tt-hero-2,
          .tt-hero-3,
          .tt-hero-4,
          .tt-hero-visual {
            opacity: 1;
            animation: none;
          }

          .tt-ambient,
          .tt-grid,
          .tt-scroll-cue {
            animation: none;
          }

          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <main className="min-h-screen overflow-x-hidden bg-white text-[#092B5F]">

        <HomeHeader
          authenticated={authenticated}
          authLoading={authLoading}
          student={student}
        />

        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="relative overflow-hidden">

          {/* Ambient atmosphere */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="tt-ambient absolute -right-44 -top-40 h-[520px] w-[520px] rounded-full bg-[#F5C542]/10 blur-3xl" />

            <div className="tt-ambient absolute -left-52 top-[420px] h-[500px] w-[500px] rounded-full bg-blue-50 blur-3xl [animation-delay:-4s]" />

            <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_68%_38%,rgba(11,59,130,0.035),transparent_34%)]" />
          </div>

          <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:grid-cols-[1.02fr_.98fr] lg:gap-20 lg:pt-28">

            {/* =====================================================
                HERO COPY
            ===================================================== */}

            <div>

              <div className="tt-hero-1 mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#F5C542]/40 bg-[#FFF9E7] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#F5C542]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#725700]">
                  Pallavi Engineering College
                </span>
              </div>

              <h1 className="tt-hero-2 max-w-[780px] text-[clamp(3.2rem,6vw,5.75rem)] font-black leading-[0.94] tracking-[-0.055em] text-[#092B5F]">

                Find your people.
                <br />

                <span className="text-[#0B3B82]">
                  Follow your passion.
                </span>

              </h1>

              <p className="tt-hero-3 mt-8 max-w-[620px] text-[17px] leading-8 text-[#475569] sm:text-[19px]">
                A home for every passion — discover clubs, meet people who
                share your interests, and turn your college experience into
                something meaningful.
              </p>

              <div className="tt-hero-4 mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/clubs"
                  className="group inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(11,59,130,0.16)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#092F69] hover:shadow-[0_16px_34px_rgba(11,59,130,0.2)] active:translate-y-0 active:shadow-[0_8px_18px_rgba(11,59,130,0.12)] focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
                >
                  Explore clubs

                  <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/requests/new"
                  className="group inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-sm font-bold text-[#0B3B82] transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#0B3B82] hover:bg-[#F8FAFD] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
                >
                  Start a club

                  <ArrowUpRight className="ml-2 h-4 w-4 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

              </div>

              <div className="tt-hero-4 mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#64748B]">
                <span>Discover</span>
                <span className="text-[#CBD5E1]">/</span>
                <span>Connect</span>
                <span className="text-[#CBD5E1]">/</span>
                <span>Create</span>
                <span className="text-[#CBD5E1]">/</span>
                <span>Lead</span>
              </div>

            </div>

            {/* =====================================================
                HERO VISUAL
            ===================================================== */}

            <div className="tt-hero-visual relative mx-auto w-full max-w-[560px]">

              <div
                aria-hidden="true"
                className="absolute -inset-7 rounded-[2.75rem] bg-blue-50/70 blur-2xl"
              />

              <div className="relative rounded-[2rem] border border-[#E2E8F0] bg-white p-2 shadow-[0_30px_80px_rgba(9,43,95,0.12)] transition duration-500 hover:shadow-[0_34px_90px_rgba(9,43,95,0.15)]">

                <div className="overflow-hidden rounded-[1.55rem] bg-[#092B5F]">

                  <div className="relative min-h-[430px] p-7 sm:p-9">

                    {/* Animated grid */}

                    <div
                      aria-hidden="true"
                      className="tt-grid pointer-events-none absolute -inset-10 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.75) 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                      }}
                    />

                    <div className="relative">

                      <div className="flex items-start justify-between">

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                            THAARA THEERAM
                          </p>

                          <h2 className="mt-3 max-w-[310px] text-3xl font-black leading-tight tracking-[-0.03em] text-white sm:text-4xl">
                            Your interests
                            <br />
                            have a place.
                          </h2>
                        </div>

                        <div className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5C542] transition-transform duration-300 ease-out hover:rotate-3 hover:scale-105">
                          <Sparkle className="h-5 w-5 text-[#092B5F]" />
                        </div>

                      </div>

                      {/* Stats */}

                      <div className="mt-10 grid grid-cols-2 gap-3">

                        <div className="rounded-2xl bg-white/[0.08] p-5 transition-colors duration-200 hover:bg-white/[0.12]">
                          <p className="text-3xl font-black tracking-tight text-white">
                            {loadingClubs ? (
                              <span className="inline-block h-8 w-8 animate-pulse rounded-md bg-white/10" />
                            ) : (
                              clubs.length
                            )}
                          </p>

                          <p className="mt-1 text-xs font-medium text-blue-200">
                            Active clubs
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#F5C542] p-5 transition-transform duration-200 hover:-translate-y-0.5">
                          <p className="text-3xl font-black tracking-tight text-[#092B5F]">
                            ∞
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#092B5F]/70">
                            Possibilities
                          </p>
                        </div>

                      </div>

                      {/* Journey panel */}

                      <div className="mt-3 rounded-2xl bg-white p-5 transition-transform duration-300 ease-out hover:-translate-y-0.5">

                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                          {authenticated
                            ? `Welcome back, ${student?.name || 'student'}`
                            : 'Your journey starts here'}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-4">

                          <div>
                            <h3 className="text-sm font-bold text-[#0F172A]">
                              {authenticated
                                ? 'Continue exploring'
                                : 'Find something that feels like you'}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-[#64748B]">
                              {authenticated
                                ? 'Open your dashboard and see what needs your attention.'
                                : 'Browse campus communities and discover where you belong.'}
                            </p>
                          </div>

                          <Link
                            href={
                              authenticated
                                ? '/dashboard'
                                : '/clubs'
                            }
                            aria-label={
                              authenticated
                                ? 'Open dashboard'
                                : 'Explore clubs'
                            }
                            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B3B82] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
                          >
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>

                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Floating brand detail */}

              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-xl shadow-blue-950/10 sm:block lg:-left-8">
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5C542]/20">
                    <Users className="h-4 w-4 text-[#0B3B82]" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Campus
                    </p>

                    <p className="mt-0.5 text-xs font-bold text-[#092B5F]">
                      Clubs • People • Possibilities
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Quiet scroll cue */}

          <a
            href="#clubs"
            aria-label="Scroll to discover clubs"
            className="tt-scroll-cue absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[#94A3B8] md:flex"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
              Explore
            </span>

            <ArrowDown className="h-4 w-4" />
          </a>

        </section>

        {/* =========================================================
            DISCOVERY
        ========================================================= */}

        <section
          id="clubs"
          className="border-y border-[#E2E8F0]/70 bg-[#F8FAFD]"
        >
          <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 md:py-24">

            <Reveal>
              <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
                    Discover
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#092B5F] sm:text-4xl">
                    Find your space.
                  </h2>

                  <p className="mt-4 max-w-[600px] text-sm leading-7 text-[#64748B] sm:text-base">
                    Explore the communities shaping campus life. Find
                    something that interests you, or discover something
                    completely new.
                  </p>
                </div>

                <Link
                  href="/clubs"
                  className="group inline-flex min-h-11 shrink-0 items-center self-start rounded-xl border border-[#CBD5E1] bg-white px-5 text-sm font-bold text-[#0B3B82] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[#0B3B82] hover:bg-blue-50 md:self-auto"
                >
                  View all clubs

                  <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

              </div>
            </Reveal>

            <div className="mt-11">

              {loadingClubs ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5].map((item, index) => (
                    <ClubSkeleton
                      key={item}
                      delay={index * 70}
                    />
                  ))}
                </div>
              ) : clubsError ? (
                <Reveal>
                  <div className="rounded-3xl border border-[#E2E8F0] bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-[#0F172A]">
                      We couldn't load the clubs.
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                      Something went wrong while loading the club directory.
                      Please try again.
                    </p>

                    <button
                      type="button"
                      onClick={loadHomeData}
                      className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#0B3B82] px-5 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#092F69] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
                    >
                      Try again
                    </button>
                  </div>
                </Reveal>
              ) : clubs.length === 0 ? (
                <Reveal>
                  <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <Compass className="h-5 w-5 text-[#0B3B82]" />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-[#0F172A]">
                      Your club directory is taking shape.
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                      There aren't any active clubs available yet. Check back
                      soon as more communities come to life.
                    </p>

                    <Link
                      href="/requests/new"
                      className="group mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#0B3B82] px-5 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#092F69]"
                    >
                      Start a club

                      <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </Reveal>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {clubs.slice(0, 5).map((club, index) => (
                      <Reveal
                        key={club.id}
                        delay={index * 70}
                      >
                        <ClubCard club={club} />
                      </Reveal>
                    ))}
                  </div>

                  {clubs.length > 5 && (
                    <Reveal delay={100}>
                      <div className="mt-10 text-center">
                        <Link
                          href="/clubs"
                          className="group inline-flex min-h-11 items-center rounded-xl bg-[#0B3B82] px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#092F69] hover:shadow-xl active:translate-y-0"
                        >
                          Explore all {clubs.length} clubs

                          <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </Reveal>
                  )}
                </>
              )}

            </div>
          </div>
        </section>

        {/* =========================================================
            JOURNEY
        ========================================================= */}

        <section
          id="about"
          className="bg-white"
        >
          <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 md:py-28">

            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

              <Reveal>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
                    Possibilities
                  </p>

                  <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-[#092B5F] sm:text-4xl">
                    One student.
                    <br />
                    Many possibilities.
                  </h2>

                  <p className="mt-5 max-w-[430px] text-sm leading-7 text-[#64748B] sm:text-base">
                    Your interests don't have to stay interests. Discover
                    communities, become part of them, contribute, and
                    eventually help shape them.
                  </p>
                </div>
              </Reveal>

              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">

                <Reveal delay={50}>
                  <Feature
                    number="01"
                    title="Discover"
                    description="Explore clubs, understand what they do, and find communities that match your interests."
                  />
                </Reveal>

                <Reveal delay={120}>
                  <Feature
                    number="02"
                    title="Join"
                    description="Apply to become part of a club while keeping your participation connected to your student identity."
                  />
                </Reveal>

                <Reveal delay={190}>
                  <Feature
                    number="03"
                    title="Participate"
                    description="Stay connected with announcements, activities, people, and everything happening across your clubs."
                  />
                </Reveal>

                <Reveal delay={260}>
                  <Feature
                    number="04"
                    title="Lead"
                    description="Take responsibility as a Coordinator or Head and help your community grow."
                  />
                </Reveal>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            START SOMETHING
        ========================================================= */}

        <section className="px-5 pb-20 sm:px-8 md:pb-28">

          <Reveal>
            <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[#092B5F]">

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#F5C542]/10 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
              />

              <div className="relative px-7 py-16 sm:px-12 sm:py-20 lg:px-20">

                <div className="max-w-[720px]">

                  <div className="group flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5C542] transition-transform duration-300 hover:rotate-3 hover:scale-105">
                    <Plus className="h-5 w-5 text-[#092B5F]" />
                  </div>

                  <p className="mt-7 text-[11px] font-black uppercase tracking-[0.2em] text-[#F5C542]">
                    Start something
                  </p>

                  <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                    Don't see your community?
                  </h2>

                  <p className="mt-5 max-w-[620px] text-sm leading-7 text-blue-100 sm:text-base">
                    Maybe it hasn't been created yet. Bring your idea to
                    campus, gather people around it, and start something
                    meaningful.
                  </p>

                  <Link
                    href="/requests/new"
                    className="group mt-8 inline-flex min-h-12 items-center rounded-xl bg-[#F5C542] px-6 text-sm font-black text-[#092B5F] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#FFD65F] active:translate-y-0"
                  >
                    Start a club request

                    <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                </div>
              </div>
            </div>
          </Reveal>

        </section>

        <HomeFooter authenticated={authenticated} />

      </main>
    </>
  )
}

/* ===============================================================
   SCROLL REVEAL
=============================================================== */

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      },
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref])

  return (
    <div
      ref={setRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translate3d(0, 0, 0)'
          : 'translate3d(0, 14px, 0)',
        transition: `opacity 650ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 650ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ===============================================================
   HEADER
=============================================================== */

function HomeHeader({
  authenticated,
  authLoading,
  student,
}: {
  authenticated: boolean
  authLoading: boolean
  student: Student | null
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">

        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0B3B82] transition-transform duration-200 group-hover:scale-[1.03]">

            <img
              src="/brand/thaara-mark.png"
              alt=""
              className="h-7 w-7 object-contain"
            />

          </div>

          <div className="hidden leading-none sm:block">
            <div className="text-[16px] font-black tracking-[-0.02em] text-[#0B3B82]">
              THAARA THEERAM
            </div>

            <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
              Clubs • People • Possibilities
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">

          <Link
            href="/clubs"
            className="relative py-2 text-sm font-semibold text-[#475569] transition-colors duration-200 hover:text-[#0B3B82]"
          >
            Explore Clubs
          </Link>

          <a
            href="#about"
            className="relative py-2 text-sm font-semibold text-[#475569] transition-colors duration-200 hover:text-[#0B3B82]"
          >
            About
          </a>

          <Link
            href="/requests/new"
            className="relative py-2 text-sm font-semibold text-[#475569] transition-colors duration-200 hover:text-[#0B3B82]"
          >
            Start a Club
          </Link>

        </nav>

        <div className="hidden md:block">

          {authLoading ? (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-[#F1F5F9]" />
          ) : authenticated ? (
            <Link
              href="/dashboard"
              className="group inline-flex min-h-10 items-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#092F69] hover:shadow-lg hover:shadow-blue-900/10 active:translate-y-0"
            >
              <span className="max-w-[130px] truncate">
                {student?.name || 'Dashboard'}
              </span>

              <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#092F69] hover:shadow-lg hover:shadow-blue-900/10 active:translate-y-0"
            >
              Student Login
            </Link>
          )}

        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#0B3B82] transition-[transform,background-color] duration-200 hover:bg-[#F8FAFD] active:scale-95 md:hidden"
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </div>

      {menuOpen && (
        <div className="border-t border-[#E2E8F0] bg-white px-5 py-5 md:hidden">
          <nav className="mx-auto max-w-[1280px] space-y-1">

            <Link
              href="/clubs"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-3 text-sm font-bold text-[#334155] transition-colors hover:bg-[#F8FAFD] hover:text-[#0B3B82]"
            >
              Explore Clubs
            </Link>

            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-3 text-sm font-bold text-[#334155] transition-colors hover:bg-[#F8FAFD] hover:text-[#0B3B82]"
            >
              About
            </a>

            <Link
              href="/requests/new"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-3 text-sm font-bold text-[#334155] transition-colors hover:bg-[#F8FAFD] hover:text-[#0B3B82]"
            >
              Start a Club
            </Link>

            <div className="pt-3">

              {authenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition-colors hover:bg-[#092F69]"
                >
                  Open Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-[#0B3B82] px-4 text-sm font-bold text-white transition-colors hover:bg-[#092F69]"
                >
                  Student Login
                </Link>
              )}

            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

/* ===============================================================
   CLUB CARD
=============================================================== */

function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group block overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(9,43,95,0.09)] focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
    >

      <div className="relative h-40 overflow-hidden bg-[#092B5F]">

        {club.logo_url ? (
          <img
            src={club.logo_url}
            alt={`${club.name} logo`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] transition-transform duration-300 group-hover:scale-105">
              <span className="text-2xl font-black text-[#F5C542]">
                {getClubInitials(club.name)}
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#092B5F] via-[#092B5F]/10 to-transparent" />

        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3">

          <span className="max-w-[75%] truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3B82]">
            {club.category || 'Club'}
          </span>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-[transform,background-color,color] duration-200 group-hover:bg-[#F5C542] group-hover:text-[#092B5F]">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

        </div>
      </div>

      <div className="p-6">

        <h3 className="text-xl font-black tracking-[-0.025em] text-[#0F172A] transition-colors duration-200 group-hover:text-[#0B3B82]">
          {club.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">
          {club.short_description ||
            club.description ||
            'Discover this club and see what they are building.'}
        </p>

        <div className="mt-5 flex items-center text-xs font-bold text-[#0B3B82]">

          Explore club

          <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />

        </div>

      </div>
    </Link>
  )
}

/* ===============================================================
   FEATURE
=============================================================== */

function Feature({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="group border-t border-[#E2E8F0] pt-5">

      <div className="flex items-center justify-between">

        <span className="text-[11px] font-black tracking-[0.18em] text-[#F0B900]">
          {number}
        </span>

        <ArrowUpRight className="h-4 w-4 text-[#0B3B82] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

      </div>

      <h3 className="mt-7 text-xl font-black tracking-[-0.025em] text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#64748B]">
        {description}
      </p>

    </div>
  )
}

/* ===============================================================
   SKELETON
=============================================================== */

function ClubSkeleton({
  delay = 0,
}: {
  delay?: number
}) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="h-40 animate-pulse bg-[#E2E8F0]" />

      <div className="space-y-3 p-6">
        <div className="h-5 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
        <div className="h-4 w-full animate-pulse rounded bg-[#F1F5F9]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[#F1F5F9]" />
      </div>
    </div>
  )
}

/* ===============================================================
   FOOTER
=============================================================== */

function HomeFooter({
  authenticated,
}: {
  authenticated: boolean
}) {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#F8FAFD]">

      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">

        <div className="grid gap-10 md:grid-cols-[1.5fr_.7fr_.8fr]">

          <div>

            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B82] focus:ring-offset-2"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0B3B82]">
                <img
                  src="/brand/thaara-mark.png"
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </div>

              <div>
                <div className="font-black tracking-[-0.02em] text-[#0B3B82]">
                  THAARA THEERAM
                </div>

                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  A home for every passion
                </div>
              </div>

            </Link>

            <p className="mt-5 max-w-[440px] text-sm leading-6 text-[#64748B]">
              The student club ecosystem of Pallavi Engineering College —
              connecting clubs, people and possibilities.
            </p>

          </div>

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
              Explore
            </p>

            <div className="mt-4 space-y-3 text-sm">

              <Link
                href="/clubs"
                className="block font-medium text-[#475569] transition-colors hover:text-[#0B3B82]"
              >
                Clubs
              </Link>

              {authenticated ? (
                <Link
                  href="/dashboard"
                  className="block font-medium text-[#475569] transition-colors hover:text-[#0B3B82]"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block font-medium text-[#475569] transition-colors hover:text-[#0B3B82]"
                >
                  Student Login
                </Link>
              )}

              <Link
                href="/requests/new"
                className="block font-medium text-[#475569] transition-colors hover:text-[#0B3B82]"
              >
                Start a Club
              </Link>

            </div>

          </div>

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
              Campus
            </p>

            <div className="mt-4 text-sm leading-6 text-[#64748B]">

              <p className="font-semibold text-[#334155]">
                Pallavi Engineering College
              </p>

              <p className="mt-2">
                Kuntloor, Hayathnagar
                <br />
                Hyderabad, Telangana
              </p>

            </div>

          </div>

        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#E2E8F0] pt-6 text-xs text-[#94A3B8] sm:flex-row">

          <span>
            © 2026 Thaara Theeram. All rights reserved.
          </span>

          <span>
            Clubs • People • Possibilities
          </span>

        </div>

      </div>
    </footer>
  )
}

/* ===============================================================
   ICONS
=============================================================== */

function ArrowRight({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10h11" />
      <path d="m11 5 5 5-5 5" />
    </svg>
  )
}

function ArrowUpRight({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 15 15 5" />
      <path d="M7 5h8v8" />
    </svg>
  )
}

function ArrowDown({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 3v12" />
      <path d="m5.5 11 4.5 4.5 4.5-4.5" />
    </svg>
  )
}

function Sparkle({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path d="m10 2 1.5 5.5L17 10l-5.5 1.5L10 17l-1.5-5.5L3 10l5.5-2.5L10 2Z" />
    </svg>
  )
}

function Users({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="3" />
      <path d="M2.5 17c.4-3 2-4.5 4.5-4.5S11.1 14 11.5 17" />
      <path d="M13 4.5a3 3 0 0 1 0 5.8" />
      <path d="M14 12.7c2 .3 3.2 1.7 3.5 4.3" />
    </svg>
  )
}

function Plus({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

function Menu({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  )
}

function X({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  )
}

function Compass({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="m12.8 7.2-1.7 3.9-3.9 1.7 1.7-3.9 3.9-1.7Z" />
    </svg>
  )
}

function AlertCircle({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4.5M10 13.5v.5" />
    </svg>
  )
}

function getClubInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 'C'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}