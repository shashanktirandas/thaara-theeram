import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JoinClubButton from '@/components/clubs/JoinClubButton'
import ShareClubButton from '@/components/clubs/ShareClubButton'
import Link from 'next/link'
import LeaveClubButton from '@/components/clubs/LeaveClubButton'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createClient()

  // ─────────────────────────────────────────────
  // CLUB
  // ─────────────────────────────────────────────

  const { data: club, error } = await supabase
    .from('clubs')
    .select(`
      id,
      name,
      slug,
      category,
      tagline,
      short_description,
      description,
      vision,
      mission,
      activities,
      logo_url,
      banner_url,
      status,
      whatsapp_group_url,
      instagram_url,
      linkedin_url,
      youtube_url
    `)
    .eq('slug', slug)
    .eq('status', 'ACTIVE')
    .single()

  if (error || !club) {
    notFound()
  }

  // ─────────────────────────────────────────────
  // CURRENT STUDENT
  // ─────────────────────────────────────────────

  let currentClubStatus:
    | 'JOIN'
    | 'PENDING'
    | 'MEMBER'
    | 'HEAD'
    | 'COORDINATOR' = 'JOIN'
  let isAdmin = false
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (student) {
      const { data: adminRole } = await supabase
  .from('admin_roles')
  .select('id')
  .eq('student_id', student.id)
  .eq('status', 'ACTIVE')
  .maybeSingle()

isAdmin = !!adminRole
      const { data: membership } = await supabase
        .from('club_members')
        .select('role, status')
        .eq('club_id', club.id)
        .eq('student_id', student.id)
        .maybeSingle()

      if (membership?.status === 'ACTIVE') {
        if (membership.role === 'HEAD') {
          currentClubStatus = 'HEAD'
        } else if (membership.role === 'COORDINATOR') {
          currentClubStatus = 'COORDINATOR'
        } else {
          currentClubStatus = 'MEMBER'
        }
      } else {
        const { data: application } = await supabase
          .from('club_applications')
          .select('status')
          .eq('club_id', club.id)
          .eq('student_id', student.id)
          .eq('status', 'PENDING')
          .maybeSingle()

        if (application) {
          currentClubStatus = 'PENDING'
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC MEMBERS
  // ─────────────────────────────────────────────

  const { data: publicMembers } = await supabase
    .from('club_public_members')
    .select(`
      club_id,
      role,
      id,
      name,
      roll_number,
      department,
      year,
      section,
      profile_photo_url
    `)
    .eq('club_id', club.id)
    .order('role', { ascending: true })

  const members =
    publicMembers?.map((member) => ({
      role: member.role,
      student: {
        id: member.id,
        name: member.name,
        roll_number: member.roll_number,
        department: member.department,
        year: member.year,
        section: member.section,
        profile_photo_url: member.profile_photo_url,
      },
    })) ?? []

  const head = members.find(
    (member) => member.role === 'HEAD'
  )

  const coordinators = members.filter(
    (member) => member.role === 'COORDINATOR'
  )

  // ─────────────────────────────────────────────
  // ANNOUNCEMENTS
  // ─────────────────────────────────────────────

  const announcementVisibilities =
    currentClubStatus === 'MEMBER' ||
    currentClubStatus === 'HEAD' ||
    currentClubStatus === 'COORDINATOR'
      ? ['PUBLIC', 'MEMBERS_ONLY']
      : ['PUBLIC']

  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
      id,
      title,
      content,
      visibility,
      created_at,
      updated_at
    `)
    .eq('club_id', club.id)
    .in('visibility', announcementVisibilities)
    .order('created_at', { ascending: false })
    .limit(6)

  // ─────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* ═══════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════ */}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="text-lg font-black tracking-tight text-blue-700"
          >
            THAARA THEERAM
          </Link>

          <div className="flex items-center gap-5">

            {user ? (
              <>
                {(currentClubStatus === 'HEAD' ||
currentClubStatus === 'COORDINATOR' ||
isAdmin) && (
                  <Link
                    href={`/clubs/${club.slug}/manage`}
                    className="hidden text-sm font-semibold text-blue-700 transition hover:text-blue-900 sm:block"
                  >
                    Manage Club
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href={`/login?returnTo=/clubs/${club.slug}`}
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </nav>


      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}

      <section className="relative overflow-hidden bg-slate-950">

        {club.banner_url && (
          <img
            src={club.banner_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-950/90 to-slate-950/95" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">

          <div className="max-w-4xl">

            {/* Logo */}

            <div className="mb-8 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl">

              {club.logo_url ? (
                <img
                  src={club.logo_url}
                  alt={`${club.name} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-4xl font-black text-blue-700">
                  {club.name.charAt(0)}
                </span>
              )}

            </div>


            {/* Category */}

            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                {club.category || 'Student Club'}
              </span>

              <span className="text-sm text-slate-400">
                Pallavi Engineering College
              </span>

            </div>


            {/* Name */}

            <h1 className="mt-6 text-5xl font-black tracking-tight text-white md:text-7xl">
              {club.name}
            </h1>


            {/* Tagline */}

            {club.tagline && (
              <p className="mt-4 text-xl font-medium text-yellow-300 md:text-2xl">
                {club.tagline}
              </p>
            )}


            {/* Description */}

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
              {club.short_description}
            </p>


            {/* Actions */}

            <div className="mt-10 flex flex-wrap items-center gap-4">

              <JoinClubButton
                slug={club.slug}
                initialStatus={currentClubStatus}
              />

              {(currentClubStatus === 'MEMBER' ||
                currentClubStatus === 'COORDINATOR') && (
                <LeaveClubButton slug={club.slug} />
              )}

              <ShareClubButton
                clubName={club.name}
                slug={club.slug}
                shortDescription={club.short_description}
                clubLogoUrl={club.logo_url}
              />

            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          ABOUT
      ═══════════════════════════════════════ */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

        <div className="grid gap-14 lg:grid-cols-[1.4fr_0.6fr]">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              About the club
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              A place to learn, create and belong.
            </h2>

            <p className="mt-7 whitespace-pre-line text-lg leading-8 text-slate-600">
              {club.description}
            </p>

          </div>


          {/* Club snapshot */}

          <div className="h-fit rounded-[2rem] border border-slate-200 bg-slate-50 p-8">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Club
            </p>

            <h3 className="mt-3 text-2xl font-black">
              {club.name}
            </h3>

            <div className="my-7 h-px bg-slate-200" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Category
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {club.category || 'Student Club'}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                People
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {members.length}{' '}
                {members.length === 1 ? 'person' : 'people'}
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════════════
          VISION / MISSION
      ═══════════════════════════════════════ */}

      {(club.vision || club.mission) && (
        <section className="border-y border-slate-200 bg-slate-50">

          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">

            <div className="mb-12">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                What drives us
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                Purpose behind the passion.
              </h2>
            </div>


            <div className="grid gap-6 md:grid-cols-2">

              {club.vision && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">
                    Vision
                  </p>

                  <p className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-600">
                    {club.vision}
                  </p>

                </div>
              )}


              {club.mission && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                    Mission
                  </p>

                  <p className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-600">
                    {club.mission}
                  </p>

                </div>
              )}

            </div>

          </div>

        </section>
      )}


      {/* ═══════════════════════════════════════
          ACTIVITIES
      ═══════════════════════════════════════ */}

      {club.activities && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

          <div className="grid gap-12 md:grid-cols-[0.65fr_1.35fr]">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                What we do
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                Experiences that bring people together.
              </h2>

            </div>


            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">

              <p className="whitespace-pre-line text-lg leading-8 text-slate-600">
                {club.activities}
              </p>

            </div>

          </div>

        </section>
      )}


      {/* ═══════════════════════════════════════
          ANNOUNCEMENTS
      ═══════════════════════════════════════ */}

      <section className="border-y border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">

          <div className="mb-12">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Latest updates
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              What’s happening at {club.name}
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-7 text-slate-600">
              Stay up to date with the latest news, activities and
              opportunities from the club.
            </p>

          </div>


          {announcements && announcements.length > 0 ? (

            <div className="grid gap-6 md:grid-cols-2">

              {announcements.map((announcement) => (

                <article
                  key={announcement.id}
                  className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex items-center justify-between gap-4">

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {new Date(
                        announcement.created_at
                      ).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>

                    {announcement.visibility === 'MEMBERS_ONLY' && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                        Members only
                      </span>
                    )}

                  </div>


                  <h3 className="mt-5 text-xl font-black tracking-tight">
                    {announcement.title}
                  </h3>

                  <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                    {announcement.content}
                  </p>

                  {announcement.updated_at !==
                    announcement.created_at && (
                    <p className="mt-5 text-xs text-slate-400">
                      Edited
                    </p>
                  )}

                </article>

              ))}

            </div>

          ) : (

            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

              <p className="text-lg font-bold text-slate-700">
                No announcements yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Check back soon for updates from {club.name}.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ═══════════════════════════════════════
          PEOPLE
      ═══════════════════════════════════════ */}

      {(head || coordinators.length > 0) && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

          <div className="mb-12">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              The people
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Meet the team.
            </h2>

            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              The students helping {club.name} grow and create
              meaningful experiences.
            </p>

          </div>


          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {/* Head */}

            {head && (
  <Link
    href={`/students/${encodeURIComponent(
      head.student?.roll_number ?? ''
    )}`}
    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
  >

                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100">

                  {head.student.profile_photo_url ? (
                    <img
                      src={head.student.profile_photo_url}
                      alt={head.student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-blue-700">
                      {head.student.name.charAt(0)}
                    </span>
                  )}

                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">
                  Head
                </p>

                <h3 className="mt-2 text-xl font-black">
                  {head.student.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {head.student.roll_number}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {head.student.department} · {head.student.year}
                </p>
                <p className="mt-4 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  View profile →
                </p>

              </Link>
            )}


            {/* Coordinators */}

            {coordinators.map((coordinator) => (

              <Link
                key={coordinator.student.id}
                href={`/students/${encodeURIComponent(
                  coordinator.student?.roll_number ?? ''
                )}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >

                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100">

                  {coordinator.student.profile_photo_url ? (
                    <img
                      src={coordinator.student.profile_photo_url}
                      alt={coordinator.student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-blue-700">
                      {coordinator.student.name.charAt(0)}
                    </span>
                  )}

                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Coordinator
                </p>

                <h3 className="mt-2 text-xl font-black">
                  {coordinator.student.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {coordinator.student.roll_number}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {coordinator.student.department} ·{' '}
                  {coordinator.student.year}
                </p>
                <p className="mt-4 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  View profile →
                </p>

              </Link>

            ))}

          </div>

        </section>
      )}


      {/* ═══════════════════════════════════════
          COMMUNITY
      ═══════════════════════════════════════ */}

      <section className="px-6 pb-20 md:pb-24">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-blue-700">

          <div className="relative px-8 py-14 md:px-14 md:py-16">

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="relative">

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
                Stay connected
              </p>

              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
                Be part of {club.name}.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
                Join the club community and stay connected with
                upcoming activities, opportunities and announcements.
              </p>


              <div className="mt-9 flex flex-wrap gap-3">

                {club.whatsapp_group_url && (
                  <a
                    href={club.whatsapp_group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    WhatsApp Community
                  </a>
                )}

                {club.instagram_url && (
                  <a
                    href={club.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Instagram
                  </a>
                )}

                {club.linkedin_url && (
                  <a
                    href={club.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    LinkedIn
                  </a>
                )}

                {club.youtube_url && (
                  <a
                    href={club.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    YouTube
                  </a>
                )}

              </div>

            </div>
          </div>

        </div>

      </section>


      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="font-black tracking-tight text-slate-900">
              THAARA THEERAM
            </p>

            <p className="mt-1 text-sm text-slate-500">
              A home for every passion.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Clubs • People • Possibilities
            </p>

          </div>

          <div className="text-left md:text-right">

            <p className="text-sm text-slate-500">
              {club.name}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pallavi Engineering College
            </p>

            <p className="mt-2 text-xs text-slate-400">
              © 2026 Thaara Theeram
            </p>

          </div>

        </div>

      </footer>

    </main>
  )
}