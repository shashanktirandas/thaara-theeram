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

const categoryIcons: Record<string, string> = {
  Technical: '⌘',
  Cultural: '✦',
  'Arts & Media': '◈',
  Sports: '⚡',
  Literary: 'Aa',
  'Social & Service': '♡',
  Entrepreneurship: '↗',
  Academic: '∑',
  Other: '•',
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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

  return (
    <main className="min-h-screen bg-white text-slate-950">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B82] text-lg font-black text-white">
              T
            </div>

            <div className="leading-none">
              <div className="text-[17px] font-extrabold tracking-tight text-[#0B3B82]">
                THAARA THEERAM
              </div>

              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Clubs • People • Possibilities
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-5 sm:gap-7">
            <Link
              href="/"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-[#0B3B82] sm:block"
            >
              Home
            </Link>

            <Link
              href="/requests/new"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-[#0B3B82] sm:block"
            >
              Start a Club
            </Link>

            {user ? (
  <Link
    href="/dashboard"
    className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
  >
    Dashboard
  </Link>
) : (
  <Link
    href="/login"
    className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
  >
    Student Login
  </Link>
)}
          </nav>

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FAFD]">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 -top-20 h-80 w-80 rounded-full bg-yellow-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/50 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#092B5F] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#F5C542]" />
              Pallavi Engineering College
            </div>

            <h1 className="mt-7 text-5xl font-black tracking-[-0.04em] text-[#092B5F] sm:text-6xl lg:text-7xl">
              Find your
              <br />
              <span className="text-[#F0B900]">
                people.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore the clubs, communities and possibilities
              that make college life more meaningful.
            </p>

          </div>


          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="mt-10 max-w-3xl">

            <div className="relative">

              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-400">
                <span className="text-xl">
                  ⌕
                </span>
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search clubs, interests or communities..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0B3B82] focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          DIRECTORY
      ===================================================== */}

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">

          {/* Category filters */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
                Explore
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
                Clubs for every passion.
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {loading
                  ? 'Discovering clubs...'
                  : `${filteredClubs.length} ${
                      filteredClubs.length === 1
                        ? 'club'
                        : 'clubs'
                    } to explore`}
              </p>
            </div>

          </div>


          {/* =================================================
              CATEGORY BAR
          ================================================= */}

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">

              {categories.map((category) => {
                const active =
                  selectedCategory === category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(category)
                    }
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'border-[#0B3B82] bg-[#0B3B82] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B3B82]'
                    }`}
                  >
                    {category !== 'All' && (
                      <span className="mr-1.5">
                        {categoryIcons[category]}
                      </span>
                    )}

                    {category}
                  </button>
                )
              })}

            </div>
          </div>


          {/* =================================================
              RESULTS
          ================================================= */}

          <div className="mt-10">

            {loading ? (

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[270px] animate-pulse rounded-3xl border border-slate-100 bg-slate-50"
                  />
                ))}

              </div>

            ) : error ? (

              <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center">

                <h3 className="text-lg font-bold text-red-800">
                  Something went wrong
                </h3>

                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadClubs}
                  className="mt-5 rounded-xl bg-[#0B3B82] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
                >
                  Try again
                </button>

              </div>

            ) : filteredClubs.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-slate-200 bg-[#F8FAFD] px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ⌕
                </div>

                <h3 className="mt-5 text-xl font-black text-[#092B5F]">
                  No clubs found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find a club matching your search.
                  Try another interest or choose a different category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory('All')
                  }}
                  className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#0B3B82] transition hover:bg-blue-50"
                >
                  Clear filters
                </button>

              </div>

            ) : (

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {filteredClubs.map((club) => (

                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5"
                  >

                    {/* Top accent */}

                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B3B82] via-[#0B3B82] to-[#F5C542] opacity-0 transition group-hover:opacity-100" />


                    {/* Club identity */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-[#F8FAFD]">

                        {club.logo_url ? (
                          <img
                            src={club.logo_url}
                            alt={`${club.name} logo`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-black text-[#0B3B82]">
                            {club.name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}

                      </div>


                      {club.category && (
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3B82]">
                          {club.category}
                        </span>
                      )}

                    </div>


                    {/* Content */}

                    <div className="mt-6">

                      <h3 className="text-xl font-black tracking-tight text-[#092B5F] transition group-hover:text-[#0B3B82]">
                        {club.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                        {club.short_description ||
                          club.description ||
                          'Discover this club and find your community.'}
                      </p>

                    </div>


                    {/* Bottom */}

                    <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Explore club
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-[#0B3B82] transition group-hover:bg-[#0B3B82] group-hover:text-white">
                        →
                      </span>

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          START A CLUB
      ===================================================== */}

      <section className="border-t border-slate-100 bg-[#F8FAFD]">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

          <div className="relative overflow-hidden rounded-[2rem] bg-[#0B3B82] px-7 py-10 sm:px-10 sm:py-12">

            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#F5C542]/20 blur-3xl" />

            <div className="relative max-w-2xl">

              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F5C542]">
                Have an idea?
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Don't see your club yet?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Start something meaningful. Submit your club idea
                and let Thaara Theeram help bring your community together.
              </p>

              <Link
                href="/requests/new"
                className="mt-7 inline-flex items-center rounded-xl bg-[#F5C542] px-5 py-3 text-sm font-black text-[#092B5F] transition hover:bg-[#ffd65f]"
              >
                Start a club
                <span className="ml-3">
                  →
                </span>
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B3B82] text-sm font-black text-white">
                  T
                </div>

                <div className="font-black tracking-tight text-[#0B3B82]">
                  THAARA THEERAM
                </div>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                A home for every passion.
              </p>

            </div>


            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">

              <Link
                href="/"
                className="text-slate-500 transition hover:text-[#0B3B82]"
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
                className="text-slate-500 transition hover:text-[#0B3B82]"
              >
                Start a Club
              </Link>

              {user ? (
  <Link
    href="/dashboard"
    className="text-slate-500 transition hover:text-[#0B3B82]"
  >
    Dashboard
  </Link>
) : (
  <Link
    href="/login"
    className="text-slate-500 transition hover:text-[#0B3B82]"
  >
    Student Login
  </Link>
)}
            </div>

          </div>


          <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
            © 2026 Thaara Theeram
          </div>

        </div>

      </footer>

    </main>
  )
}