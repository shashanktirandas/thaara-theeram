// 'use client'

// import Link from 'next/link'
// import { useEffect, useMemo, useState } from 'react'
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

// const categories = [
//   'All',
//   'Technical',
//   'Cultural',
//   'Arts & Media',
//   'Sports',
//   'Literary',
//   'Social & Service',
//   'Entrepreneurship',
//   'Academic',
//   'Other',
// ]

// const categoryIcons: Record<string, string> = {
//   Technical: '⌘',
//   Cultural: '✦',
//   'Arts & Media': '◈',
//   Sports: '⚡',
//   Literary: 'Aa',
//   'Social & Service': '♡',
//   Entrepreneurship: '↗',
//   Academic: '∑',
//   Other: '•',
// }

// export default function ClubsPage() {
//   const [clubs, setClubs] = useState<Club[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [user, setUser] = useState<any>(null)

//   const [search, setSearch] = useState('')
//   const [selectedCategory, setSelectedCategory] = useState('All')

//  useEffect(() => {
//   loadUser()
//   loadClubs()
// }, [])
// async function loadUser() {
//   const supabase = createClient()

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   setUser(user)
// }
//   async function loadClubs() {
//     setLoading(true)
//     setError('')

//     try {
//       const supabase = createClient()

//       const { data, error: clubsError } = await supabase
//         .from('clubs')
//         .select(
//           `
//             id,
//             name,
//             slug,
//             category,
//             short_description,
//             description,
//             logo_url
//           `
//         )
//         .eq('status', 'ACTIVE')
//         .order('name', { ascending: true })

//       if (clubsError) {
//         console.error('Clubs loading error:', clubsError)
//         setError('Unable to load clubs right now.')
//         return
//       }

//       setClubs(data || [])
//     } catch (err) {
//       console.error('Clubs page error:', err)
//       setError('Something went wrong while loading clubs.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filteredClubs = useMemo(() => {
//     const query = search.trim().toLowerCase()

//     return clubs.filter((club) => {
//       const matchesCategory =
//         selectedCategory === 'All' ||
//         club.category === selectedCategory

//       if (!matchesCategory) {
//         return false
//       }

//       if (!query) {
//         return true
//       }

//       const searchableText = [
//         club.name,
//         club.category,
//         club.short_description,
//         club.description,
//       ]
//         .filter(Boolean)
//         .join(' ')
//         .toLowerCase()

//       return searchableText.includes(query)
//     })
//   }, [clubs, search, selectedCategory])

//   return (
//     <main className="min-h-screen bg-white text-slate-950">

//       {/* =====================================================
//           NAVIGATION
//       ===================================================== */}

//       <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
//         <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

//           <Link
//             href="/"
//             className="flex items-center gap-3"
//           >
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B82] text-lg font-black text-white">
//               T
//             </div>

//             <div className="leading-none">
//               <div className="text-[17px] font-extrabold tracking-tight text-[#0B3B82]">
//                 THAARA THEERAM
//               </div>

//               <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
//                 Clubs • People • Possibilities
//               </div>
//             </div>
//           </Link>

//           <nav className="flex items-center gap-5 sm:gap-7">
//             <Link
//               href="/"
//               className="hidden text-sm font-medium text-slate-600 transition hover:text-[#0B3B82] sm:block"
//             >
//               Home
//             </Link>

//             <Link
//               href="/requests/new"
//               className="hidden text-sm font-medium text-slate-600 transition hover:text-[#0B3B82] sm:block"
//             >
//               Start a Club
//             </Link>

//             {user ? (
//   <Link
//     href="/dashboard"
//     className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
//   >
//     Dashboard
//   </Link>
// ) : (
//   <Link
//     href="/login"
//     className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
//   >
//     Student Login
//   </Link>
// )}
//           </nav>

//         </div>
//       </header>


//       {/* =====================================================
//           HERO
//       ===================================================== */}

//       <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FAFD]">

//         {/* Decorative background */}
//         <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

//         <div className="pointer-events-none absolute -right-32 -top-20 h-80 w-80 rounded-full bg-yellow-100/70 blur-3xl" />

//         <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">

//           <div className="max-w-3xl">

//             <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/50 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#092B5F] shadow-sm">
//               <span className="h-2 w-2 rounded-full bg-[#F5C542]" />
//               Pallavi Engineering College
//             </div>

//             <h1 className="mt-7 text-5xl font-black tracking-[-0.04em] text-[#092B5F] sm:text-6xl lg:text-7xl">
//               Find your
//               <br />
//               <span className="text-[#F0B900]">
//                 people.
//               </span>
//             </h1>

//             <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
//               Explore the clubs, communities and possibilities
//               that make college life more meaningful.
//             </p>

//           </div>


//           {/* =================================================
//               SEARCH
//           ================================================= */}

//           <div className="mt-10 max-w-3xl">

//             <div className="relative">

//               <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-400">
//                 <span className="text-xl">
//                   ⌕
//                 </span>
//               </div>

//               <input
//                 type="text"
//                 value={search}
//                 onChange={(event) =>
//                   setSearch(event.target.value)
//                 }
//                 placeholder="Search clubs, interests or communities..."
//                 className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0B3B82] focus:ring-4 focus:ring-blue-100"
//               />

//             </div>

//           </div>

//         </div>
//       </section>


//       {/* =====================================================
//           DIRECTORY
//       ===================================================== */}

//       <section className="bg-white">

//         <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">

//           {/* Category filters */}

//           <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

//             <div>
//               <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
//                 Explore
//               </div>

//               <h2 className="mt-2 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
//                 Clubs for every passion.
//               </h2>

//               <p className="mt-2 text-sm text-slate-500">
//                 {loading
//                   ? 'Discovering clubs...'
//                   : `${filteredClubs.length} ${
//                       filteredClubs.length === 1
//                         ? 'club'
//                         : 'clubs'
//                     } to explore`}
//               </p>
//             </div>

//           </div>


//           {/* =================================================
//               CATEGORY BAR
//           ================================================= */}

//           <div className="mt-8 overflow-x-auto pb-2">
//             <div className="flex min-w-max gap-2">

//               {categories.map((category) => {
//                 const active =
//                   selectedCategory === category

//                 return (
//                   <button
//                     key={category}
//                     type="button"
//                     onClick={() =>
//                       setSelectedCategory(category)
//                     }
//                     className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
//                       active
//                         ? 'border-[#0B3B82] bg-[#0B3B82] text-white shadow-sm'
//                         : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B3B82]'
//                     }`}
//                   >
//                     {category !== 'All' && (
//                       <span className="mr-1.5">
//                         {categoryIcons[category]}
//                       </span>
//                     )}

//                     {category}
//                   </button>
//                 )
//               })}

//             </div>
//           </div>


//           {/* =================================================
//               RESULTS
//           ================================================= */}

//           <div className="mt-10">

//             {loading ? (

//               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

//                 {[1, 2, 3, 4, 5, 6].map((item) => (
//                   <div
//                     key={item}
//                     className="h-[270px] animate-pulse rounded-3xl border border-slate-100 bg-slate-50"
//                   />
//                 ))}

//               </div>

//             ) : error ? (

//               <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center">

//                 <h3 className="text-lg font-bold text-red-800">
//                   Something went wrong
//                 </h3>

//                 <p className="mt-2 text-sm text-red-600">
//                   {error}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={loadClubs}
//                   className="mt-5 rounded-xl bg-[#0B3B82] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
//                 >
//                   Try again
//                 </button>

//               </div>

//             ) : filteredClubs.length === 0 ? (

//               <div className="rounded-3xl border border-dashed border-slate-200 bg-[#F8FAFD] px-6 py-16 text-center">

//                 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
//                   ⌕
//                 </div>

//                 <h3 className="mt-5 text-xl font-black text-[#092B5F]">
//                   No clubs found
//                 </h3>

//                 <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
//                   We couldn't find a club matching your search.
//                   Try another interest or choose a different category.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSearch('')
//                     setSelectedCategory('All')
//                   }}
//                   className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#0B3B82] transition hover:bg-blue-50"
//                 >
//                   Clear filters
//                 </button>

//               </div>

//             ) : (

//               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

//                 {filteredClubs.map((club) => (

//                   <Link
//                     key={club.id}
//                     href={`/clubs/${club.slug}`}
//                     className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5"
//                   >

//                     {/* Top accent */}

//                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B3B82] via-[#0B3B82] to-[#F5C542] opacity-0 transition group-hover:opacity-100" />


//                     {/* Club identity */}

//                     <div className="flex items-start justify-between gap-4">

//                       <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-[#F8FAFD]">

//                         {club.logo_url ? (
//                           <img
//                             src={club.logo_url}
//                             alt={`${club.name} logo`}
//                             className="h-full w-full object-cover"
//                           />
//                         ) : (
//                           <span className="text-lg font-black text-[#0B3B82]">
//                             {club.name
//                               .charAt(0)
//                               .toUpperCase()}
//                           </span>
//                         )}

//                       </div>


//                       {club.category && (
//                         <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3B82]">
//                           {club.category}
//                         </span>
//                       )}

//                     </div>


//                     {/* Content */}

//                     <div className="mt-6">

//                       <h3 className="text-xl font-black tracking-tight text-[#092B5F] transition group-hover:text-[#0B3B82]">
//                         {club.name}
//                       </h3>

//                       <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
//                         {club.short_description ||
//                           club.description ||
//                           'Discover this club and find your community.'}
//                       </p>

//                     </div>


//                     {/* Bottom */}

//                     <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">

//                       <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
//                         Explore club
//                       </span>

//                       <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-[#0B3B82] transition group-hover:bg-[#0B3B82] group-hover:text-white">
//                         →
//                       </span>

//                     </div>

//                   </Link>

//                 ))}

//               </div>

//             )}

//           </div>

//         </div>

//       </section>


//       {/* =====================================================
//           START A CLUB
//       ===================================================== */}

//       <section className="border-t border-slate-100 bg-[#F8FAFD]">

//         <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

//           <div className="relative overflow-hidden rounded-[2rem] bg-[#0B3B82] px-7 py-10 sm:px-10 sm:py-12">

//             <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#F5C542]/20 blur-3xl" />

//             <div className="relative max-w-2xl">

//               <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F5C542]">
//                 Have an idea?
//               </div>

//               <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
//                 Don't see your club yet?
//               </h2>

//               <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
//                 Start something meaningful. Submit your club idea
//                 and let Thaara Theeram help bring your community together.
//               </p>

//               <Link
//                 href="/requests/new"
//                 className="mt-7 inline-flex items-center rounded-xl bg-[#F5C542] px-5 py-3 text-sm font-black text-[#092B5F] transition hover:bg-[#ffd65f]"
//               >
//                 Start a club
//                 <span className="ml-3">
//                   →
//                 </span>
//               </Link>

//             </div>

//           </div>

//         </div>

//       </section>


//       {/* =====================================================
//           FOOTER
//       ===================================================== */}

//       <footer className="border-t border-slate-200 bg-white">

//         <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

//           <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

//             <div>

//               <div className="flex items-center gap-3">

//                 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B3B82] text-sm font-black text-white">
//                   T
//                 </div>

//                 <div className="font-black tracking-tight text-[#0B3B82]">
//                   THAARA THEERAM
//                 </div>

//               </div>

//               <p className="mt-3 text-xs text-slate-400">
//                 A home for every passion.
//               </p>

//             </div>


//             <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">

//               <Link
//                 href="/"
//                 className="text-slate-500 transition hover:text-[#0B3B82]"
//               >
//                 Home
//               </Link>

//               <Link
//                 href="/clubs"
//                 className="font-semibold text-[#0B3B82]"
//               >
//                 Clubs
//               </Link>

//               <Link
//                 href="/requests/new"
//                 className="text-slate-500 transition hover:text-[#0B3B82]"
//               >
//                 Start a Club
//               </Link>

//               {user ? (
//   <Link
//     href="/dashboard"
//     className="text-slate-500 transition hover:text-[#0B3B82]"
//   >
//     Dashboard
//   </Link>
// ) : (
//   <Link
//     href="/login"
//     className="text-slate-500 transition hover:text-[#0B3B82]"
//   >
//     Student Login
//   </Link>
// )}
//             </div>

//           </div>


//           <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
//             © 2026 Thaara Theeram
//           </div>

//         </div>

//       </footer>

//     </main>
//   )
// }


'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
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

const categories = [
  'All',
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

const categorySymbols: Record<string, string> = {
  Technical: '01',
  Cultural: '02',
  'Arts & Media': '03',
  Sports: '04',
  Literary: '05',
  'Social & Service': '06',
  Entrepreneurship: '07',
  Academic: '08',
  Other: '09',
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="m7 9 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SparkIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8-1.8 5.9-1.8-5.9-5.7-1.8L10.2 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ClubLogo({
  club,
  large = false,
}: {
  club: Club
  large?: boolean
}) {
  return (
    <div
      className={[
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-[#F8FAFD]',
        large ? 'h-16 w-16' : 'h-14 w-14',
      ].join(' ')}
    >
      {club.logo_url ? (
        <img
          src={club.logo_url}
          alt={`${club.name} logo`}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <span className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50" />
          <span className="relative text-xl font-black tracking-tight text-[#0B3B82]">
            {club.name.charAt(0).toUpperCase()}
          </span>
        </>
      )}
    </div>
  )
}

function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group relative flex min-h-[258px] flex-col overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#0B3B82]/20 hover:shadow-[0_18px_45px_rgba(9,43,95,0.09)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#F5C542] transition-transform duration-200 ease-out group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-4">
        <ClubLogo club={club} />

        {club.category && (
          <span className="rounded-full bg-[#F8FAFD] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B3B82] transition-colors duration-200 group-hover:bg-blue-50">
            {club.category}
          </span>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-[1.18rem] font-extrabold tracking-[-0.02em] text-[#092B5F] transition-colors duration-200 group-hover:text-[#0B3B82]">
          {club.name}
        </h3>

        <p className="mt-2.5 line-clamp-3 text-[13px] leading-6 text-slate-500">
          {club.short_description ||
            club.description ||
            'Discover this community and find your place in it.'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 transition-colors duration-200 group-hover:text-[#0B3B82]">
          Explore
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFD] text-[#0B3B82] transition-all duration-200 group-hover:bg-[#0B3B82] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function LoadingCard({ index }: { index: number }) {
  return (
    <div
      className="animate-pulse rounded-[1.65rem] border border-slate-100 bg-white p-6"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="h-14 w-14 rounded-2xl bg-slate-100" />
        <div className="h-7 w-20 rounded-full bg-slate-100" />
      </div>

      <div className="mt-7 h-5 w-2/3 rounded bg-slate-100" />
      <div className="mt-4 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />

      <div className="mt-8 flex justify-between">
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-9 w-9 rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    loadUser()
    loadClubs()
  }, [])

  async function loadUser() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
  }

  async function loadClubs() {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data, error: clubsError } = await supabase
        .from('clubs')
        .select(
          `
            id,
            name,
            slug,
            category,
            short_description,
            description,
            logo_url
          `
        )
        .eq('status', 'ACTIVE')
        .order('name', { ascending: true })

      if (clubsError) {
        console.error('Clubs loading error:', clubsError)
        setError('Unable to load clubs right now.')
        return
      }

      setClubs(data || [])
    } catch (err) {
      console.error('Clubs page error:', err)
      setError('Something went wrong while loading clubs.')
    } finally {
      setLoading(false)
    }
  }

  const filteredClubs = useMemo(() => {
    const query = search.trim().toLowerCase()

    return clubs.filter((club) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        club.category === selectedCategory

      if (!matchesCategory) {
        return false
      }

      if (!query) {
        return true
      }

      const searchableText = [
        club.name,
        club.category,
        club.short_description,
        club.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [clubs, search, selectedCategory])

  const hasFilters =
    search.trim().length > 0 || selectedCategory !== 'All'

  function clearFilters() {
    setSearch('')
    setSelectedCategory('All')
  }

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-[#F5C542]/30 selection:text-[#092B5F]">
      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
            aria-label="THAARA THEERAM home"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0B3B82] text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
              <span className="text-[17px] font-black">T</span>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#F5C542]" />
            </div>

            <div className="hidden leading-none sm:block">
              <div className="text-[16px] font-extrabold tracking-[-0.02em] text-[#0B3B82]">
                THAARA THEERAM
              </div>

              <div className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Clubs • People • Possibilities
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/"
              className="hidden rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-[#0B3B82] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10 sm:block"
            >
              Home
            </Link>

            <Link
              href="/requests/new"
              className="hidden rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-[#0B3B82] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10 sm:block"
            >
              Start a Club
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#092F6A] hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
              >
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#092F6A] hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
              >
                Student Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* =========================================================
          HERO / DISCOVERY HEADER
      ========================================================= */}

      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FAFD]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-100/45 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-32 h-[28rem] w-[28rem] rounded-full bg-amber-100/35 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#0B3B82]">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0B3B82] text-white">
                <SparkIcon className="h-3.5 w-3.5" />
              </span>
              Explore the community
            </div>

            <h1 className="mt-6 max-w-3xl text-[3.15rem] font-black leading-[0.98] tracking-[-0.055em] text-[#092B5F] sm:text-6xl lg:text-[5.3rem]">
              Find your
              <br />
              <span className="text-[#F0B900]">people.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-lg sm:leading-8">
              Discover the clubs, communities and interests that
              make your college journey more meaningful.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-9 max-w-4xl sm:mt-11">
            <label htmlFor="club-search" className="sr-only">
              Search clubs, interests or communities
            </label>

            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-400 transition-colors duration-200 group-focus-within:text-[#0B3B82]">
                <SearchIcon className="h-5 w-5" />
              </div>

              <input
                id="club-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clubs, interests or communities..."
                className="h-[58px] w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-12 text-[14px] text-slate-900 shadow-[0_8px_30px_rgba(9,43,95,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#0B3B82]/40 focus:shadow-[0_12px_36px_rgba(9,43,95,0.08)] focus:ring-4 focus:ring-[#0B3B82]/8 sm:h-16 sm:text-[15px]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DIRECTORY
      ========================================================= */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F0B900]">
                The directory
              </div>

              <h2 className="mt-2.5 text-3xl font-black tracking-[-0.035em] text-[#092B5F] sm:text-4xl">
                Communities worth exploring.
              </h2>

              <p className="mt-2.5 text-sm text-slate-400">
                {loading
                  ? 'Finding communities...'
                  : `${filteredClubs.length} ${
                      filteredClubs.length === 1
                        ? 'community'
                        : 'communities'
                    } available`}
              </p>
            </div>

            {/* Mobile filter trigger */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((value) => !value)}
              className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#092B5F] transition-colors duration-200 hover:border-[#0B3B82]/25 hover:bg-[#F8FAFD] lg:hidden"
              aria-expanded={mobileFiltersOpen}
              aria-controls="club-category-filters"
            >
              <span>Filter by interest</span>
              <ChevronDown
                className={`ml-5 h-4 w-4 transition-transform duration-200 ${
                  mobileFiltersOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* =====================================================
              CATEGORY FILTERS
          ===================================================== */}

          <div
            id="club-category-filters"
            className={`mt-7 ${
              mobileFiltersOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2">
                {categories.map((category) => {
                  const active = selectedCategory === category

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category)
                        setMobileFiltersOpen(false)
                      }}
                      aria-pressed={active}
                      className={`group/filter inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10 ${
                        active
                          ? 'border-[#0B3B82] bg-[#0B3B82] text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-[#0B3B82]/25 hover:bg-[#F8FAFD] hover:text-[#0B3B82]'
                      }`}
                    >
                      {category !== 'All' && (
                        <span
                          className={`text-[9px] font-black tracking-wider ${
                            active
                              ? 'text-[#F5C542]'
                              : 'text-slate-300 group-hover/filter:text-[#0B3B82]'
                          }`}
                        >
                          {categorySymbols[category]}
                        </span>
                      )}

                      {category}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Active filter context */}
          {hasFilters && !loading && !error && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">
                Showing results for
              </span>

              {search.trim() && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0B3B82]">
                  “{search.trim()}”
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#092B5F]">
                  {selectedCategory}
                </span>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-xs font-bold text-slate-400 underline decoration-slate-300 underline-offset-4 transition-colors duration-200 hover:text-[#0B3B82]"
              >
                Clear
              </button>
            </div>
          )}

          {/* =====================================================
              RESULTS
          ===================================================== */}

          <div className="mt-9">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingCard key={index} index={index} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[1.75rem] border border-red-100 bg-red-50/60 px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                  !
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-red-900">
                  We couldn't load the clubs.
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700/75">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadClubs}
                  className="mt-6 rounded-xl bg-[#0B3B82] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#092F6A] hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
                >
                  Try again
                </button>
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-[#F8FAFD] px-6 py-16 text-center sm:py-20">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0B3B82] shadow-sm">
                  <SearchIcon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-black tracking-tight text-[#092B5F]">
                  Nothing matches that yet.
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try another interest, search term or category.
                  There may be a community waiting for you.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#0B3B82] shadow-sm transition-all duration-200 hover:border-[#0B3B82]/20 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
                >
                  Explore all clubs
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          START A CLUB
      ========================================================= */}

      <section className="border-t border-slate-100 bg-[#F8FAFD]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#092B5F] px-6 py-9 sm:px-10 sm:py-11 lg:px-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#0B3B82] blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 right-20 h-24 w-24 rounded-full bg-[#F5C542]/10 blur-2xl"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F5C542]">
                  Have an idea?
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">
                  Build a community of your own.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75 sm:text-[15px]">
                  Don't see the community you're looking for?
                  Start something meaningful and bring people
                  together around it.
                </p>
              </div>

              <Link
                href="/requests/new"
                className="group inline-flex shrink-0 items-center justify-center rounded-xl bg-[#F5C542] px-5 py-3.5 text-sm font-black text-[#092B5F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffd65f] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5C542]/25"
              >
                Start a club
                <ArrowUpRight className="ml-2.5 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B3B82] text-sm font-black text-white">
                  T
                </span>

                <span className="font-black tracking-[-0.02em] text-[#0B3B82]">
                  THAARA THEERAM
                </span>
              </Link>

              <p className="mt-2.5 text-xs text-slate-400">
                A home for every passion.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/"
                className="text-slate-400 transition-colors duration-200 hover:text-[#0B3B82]"
              >
                Home
              </Link>

              <Link
                href="/clubs"
                className="font-semibold text-[#0B3B82]"
              >
                Clubs
              </Link>

              <Link
                href="/requests/new"
                className="text-slate-400 transition-colors duration-200 hover:text-[#0B3B82]"
              >
                Start a Club
              </Link>

              {user ? (
                <Link
                  href="/dashboard"
                  className="text-slate-400 transition-colors duration-200 hover:text-[#0B3B82]"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-slate-400 transition-colors duration-200 hover:text-[#0B3B82]"
                >
                  Student Login
                </Link>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-[11px] text-slate-400">
            © 2026 Thaara Theeram
          </div>
        </div>
      </footer>
    </main>
  )
}