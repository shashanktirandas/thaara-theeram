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

export default function HomePage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loadingClubs, setLoadingClubs] = useState(true)

  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadHomeData()
  }, [])

  async function loadHomeData() {
    const supabase = createClient()

    // ---------------------------------------------------------
    // Load public clubs
    // ---------------------------------------------------------

    const { data: clubsData, error: clubsError } = await supabase
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

    if (!clubsError && clubsData) {
      setClubs(clubsData)
    }

    setLoadingClubs(false)

    // ---------------------------------------------------------
    // Load current student session
    // ---------------------------------------------------------

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
          setIsAdmin(!!data.isAdmin)
        }
      }
    } catch (error) {
      console.error('Could not load session:', error)
    } finally {
      setAuthLoading(false)
    }
  }

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

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/clubs"
              className="text-sm font-medium text-slate-600 transition hover:text-[#0B3B82]"
            >
              Explore Clubs
            </Link>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-[#0B3B82]"
            >
              About
            </a>

            <Link
              href="/requests/new"
              className="text-sm font-medium text-slate-600 transition hover:text-[#0B3B82]"
            >
              Start a Club
            </Link>
          </nav>

          {/* =================================================
              AUTH-AWARE NAVIGATION
          ================================================= */}

          {authLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
          ) : authenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
            >
              <span className="hidden sm:inline">
                {student?.name || 'Dashboard'}
              </span>

              <span className="sm:hidden">
                Dashboard
              </span>

              <span>→</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
            >
              Student Login
            </Link>
          )}
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#F5C542]/20 blur-3xl" />
          <div className="absolute -left-40 top-48 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 sm:px-8 md:pb-28 md:pt-28 lg:grid-cols-[1.05fr_.95fr]">

          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#F5C542]/40 bg-[#FFF9E7] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#F5C542]" />

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#725700]">
                Pallavi Engineering College
              </span>
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#092B5F] sm:text-6xl lg:text-7xl">
              Find your people.
              <br />

              <span className="text-[#F0B900]">
                Follow your passion.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Thaara Theeram is a home for every passion — bringing
              together the clubs, people and possibilities that make
              college life more meaningful.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <a
                href="#clubs"
                className="inline-flex items-center justify-center rounded-2xl bg-[#0B3B82] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#082f69]"
              >
                Explore clubs

                <span className="ml-3 text-lg">
                  ↓
                </span>
              </a>

              {authenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#0B3B82] hover:text-[#0B3B82]"
                >
                  Go to dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#0B3B82] hover:text-[#0B3B82]"
                >
                  Student login
                </Link>
              )}

            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
              <span>Discover clubs</span>
              <span>•</span>
              <span>Meet people</span>
              <span>•</span>
              <span>Build something</span>
            </div>

          </div>

          {/* =================================================
              HERO CARD
          ================================================= */}

          <div className="relative mx-auto w-full max-w-xl">

            <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-950/10">

              <div className="overflow-hidden rounded-[1.5rem] bg-[#092B5F]">

                <div className="p-7 sm:p-9">

                  <div className="flex items-center justify-between">

                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                        Your campus
                      </div>

                      <div className="mt-2 text-2xl font-black text-white">
                        Your possibilities.
                      </div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5C542] text-xl font-black text-[#092B5F]">
                      ✦
                    </div>

                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-white/10 p-5">
                      <div className="text-3xl font-black text-white">
                        {loadingClubs ? '—' : clubs.length}
                      </div>

                      <div className="mt-1 text-xs font-medium text-blue-200">
                        Active clubs
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F5C542] p-5">
                      <div className="text-3xl font-black text-[#092B5F]">
                        ∞
                      </div>

                      <div className="mt-1 text-xs font-bold text-[#092B5F]/70">
                        Possibilities
                      </div>
                    </div>

                  </div>

                  <div className="mt-3 rounded-2xl bg-white p-5">

                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {authenticated
                        ? `Welcome back, ${student?.name || 'student'}`
                        : 'Start here'}
                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <div>
                        <div className="font-bold text-slate-900">
                          {authenticated
                            ? 'Continue your journey'
                            : 'Explore a club'}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {authenticated
                            ? 'Open your student dashboard.'
                            : 'Find something that feels like you.'}
                        </div>
                      </div>

                      <Link
                        href={
                          authenticated
                            ? '/dashboard'
                            : '/clubs'
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0B3B82]"
                      >
                        →
                      </Link>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
    FEATURED CLUBS
===================================================== */}

<section
  id="clubs"
  className="border-t border-slate-100 bg-[#F8FAFD]"
>
  <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">

    {/* Section heading */}

    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

      <div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
          Discover
        </div>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
          Find your space.
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          A few communities to get you started. Explore what interests
          you, meet your people and find where you belong.
        </p>
      </div>


      {/* View all clubs */}

      <Link
        href="/clubs"
        className="inline-flex shrink-0 items-center self-start rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B3B82] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 md:self-auto"
      >
        View all clubs
        <span className="ml-3 text-base">
          →
        </span>
      </Link>

    </div>


    {/* Featured clubs */}

    <div className="mt-10">

      {loadingClubs ? (

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}

        </div>

      ) : clubs.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#0B3B82]">
            ✦
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-900">
            Clubs are coming soon.
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            The club directory is being prepared. Check back soon
            to discover the communities around campus.
          </p>

          <Link
            href="/clubs"
            className="mt-6 inline-flex items-center rounded-xl bg-[#0B3B82] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#082f69]"
          >
            Explore all clubs
            <span className="ml-3">
              →
            </span>
          </Link>

        </div>

      ) : (

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {clubs.slice(0, 5).map((club) => (

            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"
            >

              {/* Club visual */}

              <div className="relative h-36 overflow-hidden bg-[#092B5F]">

                {club.logo_url ? (

                  <img
                    src={club.logo_url}
                    alt={`${club.name} logo`}
                    className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black text-[#F5C542]">
                      {categoryIcons[club.category || 'Other'] || '•'}
                    </div>

                  </div>

                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#092B5F] via-transparent to-transparent" />

                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">

                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3B82]">
                    {club.category || 'Club'}
                  </span>

                  <span className="text-xl font-bold text-white opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>

                </div>

              </div>


              {/* Club information */}

              <div className="p-6">

                <h3 className="text-xl font-black tracking-tight text-slate-900">
                  {club.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {club.short_description ||
                    club.description ||
                    'Discover this club and see what they are building.'}
                </p>

                <div className="mt-5 flex items-center text-xs font-bold text-[#0B3B82]">
                  Explore club

                  <span className="ml-2 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>


    {/* Bottom directory CTA */}

    {!loadingClubs && clubs.length > 5 && (
      <div className="mt-10 flex justify-center">

        <Link
          href="/clubs"
          className="inline-flex items-center rounded-2xl bg-[#0B3B82] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#082f69]"
        >
          Explore all {clubs.length} clubs

          <span className="ml-3 text-lg">
            →
          </span>
        </Link>

      </div>
    )}

  </div>
</section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="about"
        className="bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">

          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">

            <div>

              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
                How it works
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#092B5F] sm:text-4xl">
                One student.
                <br />
                Many possibilities.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
                One student account connects your club memberships,
                responsibilities and participation across Thaara
                Theeram.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <Feature
                number="01"
                title="Discover"
                description="Explore club pages, understand what they do and find a community that matches your interests."
              />

              <Feature
                number="02"
                title="Join"
                description="Apply to become part of a club while keeping everything connected to your student identity."
              />

              <Feature
                number="03"
                title="Participate"
                description="Stay connected with your clubs, announcements, activities and community."
              />

              <Feature
                number="04"
                title="Lead"
                description="Take responsibility as a Coordinator or Head and help your club grow."
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          START A CLUB CTA
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 md:pb-24">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#092B5F]">

          <div className="relative px-7 py-14 text-center sm:px-12 sm:py-16">

            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#F5C542]/15 blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5C542] text-xl font-black text-[#092B5F]">
                ✦
              </div>

              <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Have an idea for a club?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Think something is missing from campus? Submit a club
                request and tell us what you want to build.
              </p>

              <div className="mt-8">

                <Link
                  href="/requests/new"
                  className="inline-flex rounded-xl bg-[#F5C542] px-6 py-3.5 text-sm font-black text-[#092B5F] transition hover:bg-[#ffd65f]"
                >
                  Start a club request
                  <span className="ml-3">
                    →
                  </span>
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-[#F8FAFD]">

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">

          <div className="grid gap-10 md:grid-cols-[1.4fr_.8fr_.8fr]">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B82] font-black text-white">
                  T
                </div>

                <div>

                  <div className="font-black tracking-tight text-[#0B3B82]">
                    THAARA THEERAM
                  </div>

                  <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    A home for every passion
                  </div>

                </div>

              </div>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                The student club ecosystem of Pallavi Engineering
                College — connecting clubs, people and possibilities.
              </p>

            </div>

            <div>

              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Explore
              </div>

              <div className="mt-4 space-y-3 text-sm">

                <Link
                  href="/clubs"
                  className="block text-slate-600 hover:text-[#0B3B82]"
                >
                  Clubs
                </Link>

                {authenticated ? (
                  <Link
                    href="/dashboard"
                    className="block text-slate-600 hover:text-[#0B3B82]"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="block text-slate-600 hover:text-[#0B3B82]"
                  >
                    Student Login
                  </Link>
                )}

                <Link
                  href="/requests/new"
                  className="block text-slate-600 hover:text-[#0B3B82]"
                >
                  Request a Club
                </Link>

              </div>

            </div>

            <div>

              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                College
              </div>

              <div className="mt-4 text-sm leading-6 text-slate-500">

                <div className="font-semibold text-slate-700">
                  Pallavi Engineering College
                </div>

                <div className="mt-2">
                  Kuntloor, Hayathnagar
                  <br />
                  Hyderabad, Telangana
                </div>

              </div>

            </div>

          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">

            <div>
              © 2026 Thaara Theeram. All rights reserved.
            </div>

            <div>
              Clubs • People • Possibilities
            </div>

          </div>

        </div>

      </footer>

    </main>
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
    <div className="rounded-3xl border border-slate-200 bg-[#F8FAFD] p-6 transition hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-950/5">

      <div className="flex items-center justify-between">

        <span className="text-xs font-black tracking-widest text-[#F0B900]">
          {number}
        </span>

        <span className="text-lg font-bold text-[#0B3B82]">
          →
        </span>

      </div>

      <h3 className="mt-8 text-lg font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  )
}