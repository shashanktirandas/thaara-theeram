import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApplicationsManager from '@/components/clubs/ApplicationsManager'
import MembersManager from '@/components/clubs/MembersManager'
import AnnouncementsManager from '@/components/clubs/AnnouncementsManager'
import ClubIdentityEditor from '@/components/clubs/ClubIdentityEditor'

export default async function ClubManagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()

  /* =========================================================
     AUTHENTICATION
  ========================================================= */

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?returnTo=/clubs/${slug}/manage`)
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, name, roll_number')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) {
    redirect('/login')
  }

  /* =========================================================
     CLUB
  ========================================================= */

  const { data: club } = await supabase
    .from('clubs')
    .select(`
      id,
      name,
      slug,
      category,
      short_description,
      description,
      tagline,
      vision,
      mission,
      activities,
      logo_url,
      banner_url,
      whatsapp_group_url,
      instagram_url,
      linkedin_url,
      youtube_url,
      status
    `)
    .eq('slug', slug)
    .single()

  if (!club) {
    notFound()
  }

  /* =========================================================
     ACCESS
  ========================================================= */

  const { data: membership } = await supabase
    .from('club_members')
    .select('role, status')
    .eq('club_id', club.id)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('status')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const role = membership?.role ?? null

  const isAdmin = !!adminRole
  const isHead = role === 'HEAD'
  const isCoordinator = role === 'COORDINATOR'

  const canAccessManagement =
    isAdmin || isHead || isCoordinator

  const canEditIdentity =
    isAdmin || isHead

  if (!canAccessManagement) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl">
              !
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-red-500">
              Restricted area
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#092B5F]">
              You can't manage this club
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Club management is available only to the Club Head,
              Coordinators, and Platform Admins.
            </p>

            <Link
              href={`/clubs/${club.slug}`}
              className="mt-7 inline-flex items-center rounded-xl bg-[#0B3B82] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#082f69]"
            >
              ← Back to club
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* =========================================================
     MANAGEMENT PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <div className="flex min-w-0 items-center gap-4">

            <Link
              href={`/clubs/${club.slug}`}
              className="group flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0B3B82]"
            >
              <span className="text-lg transition-transform group-hover:-translate-x-0.5">
                ←
              </span>

              <span className="hidden sm:inline">
                {club.name}
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-[#092B5F]">
                Club Headquarters
              </p>

              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Thaara Theeram
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <Link
              href={`/clubs/${club.slug}`}
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B3B82] sm:inline-flex"
            >
              View Public Club
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f69]"
            >
              Dashboard
            </Link>

          </div>
        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-yellow-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFD] shadow-sm">

                  {club.logo_url ? (
                    <img
                      src={club.logo_url}
                      alt={`${club.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-[#0B3B82]">
                      {club.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
                    {club.category || 'Student Community'}
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-[-0.03em] text-[#092B5F] sm:text-5xl">
                    {club.name}
                  </h1>
                </div>

              </div>

              {club.tagline && (
                <p className="mt-5 max-w-2xl text-lg font-medium leading-7 text-slate-600">
                  {club.tagline}
                </p>
              )}

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Everything you need to run your club, brought together in one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                {isAdmin && (
                  <span className="rounded-full bg-[#092B5F] px-3.5 py-1.5 text-xs font-bold text-white">
                    Platform Admin
                  </span>
                )}

                {isHead && (
                  <span className="rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                    Club Head
                  </span>
                )}

                {isCoordinator && (
                  <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                    Coordinator
                  </span>
                )}

              </div>

            </div>


            <div className="flex shrink-0 gap-3">

              <Link
                href={`/clubs/${club.slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B3B82]"
              >
                View club
              </Link>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          QUICK OVERVIEW
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        <div className="mb-6">

          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
            Your workspace
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#092B5F]">
            Run your club with ease.
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage people, communication, identity and leadership from here.
          </p>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <OverviewCard
            number="01"
            title="Applications"
            description="Review students who want to join your community."
          />

          <OverviewCard
            number="02"
            title="Members"
            description="Build your team and manage club responsibilities."
          />

          <OverviewCard
            number="03"
            title="Announcements"
            description="Keep your community informed and connected."
          />

          <OverviewCard
            number="04"
            title="Identity"
            description="Shape how students discover and experience your club."
          />

        </div>

      </section>


      {/* =====================================================
          PEOPLE
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">

        <SectionHeading
          eyebrow="People"
          title="Your community"
          description="The people who make this club what it is."
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ApplicationsManager slug={club.slug} />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <MembersManager slug={club.slug} />
          </div>

        </div>

      </section>


      {/* =====================================================
          COMMUNICATION
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">

        <SectionHeading
          eyebrow="Communication"
          title="Keep your community moving."
          description="Share updates and keep members connected."
        />

        <div className="mt-6">

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <AnnouncementsManager
              slug={club.slug}
              canManage={true}
            />
          </div>

        </div>

      </section>


      {/* =====================================================
          IDENTITY
      ===================================================== */}

      {canEditIdentity && (
        <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">

          <SectionHeading
            eyebrow="Identity"
            title="Shape your club's presence."
            description="Make your club page feel like a true home for your community."
          />

          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <ClubIdentityEditor
              slug={club.slug}
              initialData={{
                name: club.name,
                category: club.category,
                tagline: club.tagline,
                short_description: club.short_description,
                description: club.description,
                vision: club.vision,
                mission: club.mission,
                activities: club.activities,
                logo_url: club.logo_url,
                banner_url: club.banner_url,
                whatsapp_group_url: club.whatsapp_group_url,
                instagram_url: club.instagram_url,
                linkedin_url: club.linkedin_url,
                youtube_url: club.youtube_url,
              }}
            />

          </div>

        </section>
      )}


      {/* =====================================================
          COMMUNITY
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">

        <SectionHeading
          eyebrow="Community"
          title="Stay connected beyond Thaara Theeram."
          description="Your club's external community links."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <CommunityLink
            label="WhatsApp"
            value={club.whatsapp_group_url}
            href={club.whatsapp_group_url}
          />

          <CommunityLink
            label="Instagram"
            value={club.instagram_url}
            href={club.instagram_url}
          />

          <CommunityLink
            label="LinkedIn"
            value={club.linkedin_url}
            href={club.linkedin_url}
          />

          <CommunityLink
            label="YouTube"
            value={club.youtube_url}
            href={club.youtube_url}
          />

        </div>

      </section>


      {/* =====================================================
          SHARE
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">

        <div className="relative overflow-hidden rounded-[2rem] bg-[#092B5F] px-7 py-10 sm:px-10 sm:py-12">

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F5C542]/20 blur-3xl" />

          <div className="relative max-w-3xl">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F5C542]">
              Share your club
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Let more students find their people.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Your club has a permanent public home on Thaara Theeram.
              Share it anywhere — or turn it into a QR code for posters,
              events and college spaces.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <div className="flex min-w-0 flex-1 items-center rounded-xl bg-white/10 px-4 py-3 text-sm text-white ring-1 ring-white/10">
                <span className="truncate">
                  /clubs/{club.slug}
                </span>
              </div>

              <Link
                href={`/clubs/${club.slug}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#F5C542] px-5 py-3 text-sm font-black text-[#092B5F] transition hover:bg-[#ffd65f]"
              >
                Open public page →
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          LEADERSHIP
      ===================================================== */}

      <section className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">

          <SectionHeading
            eyebrow="Leadership"
            title="Lead the community well."
            description="Leadership responsibilities stay clear and accountable."
          />

          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[#F8FAFD] p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Your access
                </p>

                <p className="mt-2 text-xl font-black text-[#092B5F]">
                  {isAdmin
                    ? 'Platform Admin'
                    : isHead
                    ? 'Club Head'
                    : 'Coordinator'}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {isAdmin
                    ? 'You have platform-level authority across Thaara Theeram.'
                    : isHead
                    ? 'You have full club-level management responsibility.'
                    : 'You have operational management responsibility for this club.'}
                </p>

              </div>

              {(isHead || isAdmin) && (
                <Link
                  href={`/clubs/${club.slug}/manage`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B3B82] transition hover:border-blue-200 hover:bg-blue-50"
                >
                  Leadership controls →
                </Link>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">

          <p>
            {club.name} · Thaara Theeram
          </p>

          <Link
            href={`/clubs/${club.slug}`}
            className="font-semibold text-[#0B3B82] hover:text-[#082f69]"
          >
            Return to public club →
          </Link>

        </div>

      </footer>

    </main>
  )
}


/* ============================================================
   SMALL UI COMPONENTS
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>

      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F0B900]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight text-[#092B5F] sm:text-3xl">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  )
}


function OverviewCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5">

      <div className="flex items-center justify-between">

        <span className="text-xs font-black tracking-[0.18em] text-[#F0B900]">
          {number}
        </span>

        <span className="text-lg text-slate-300 transition group-hover:text-[#0B3B82]">
          →
        </span>

      </div>

      <h3 className="mt-7 text-lg font-black text-[#092B5F]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  )
}


function CommunityLink({
  label,
  value,
  href,
}: {
  label: string
  value: string | null
  href: string | null
}) {
  if (!value || !href) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-5">

        <p className="text-sm font-black text-slate-700">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Not connected yet
        </p>

      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5"
    >

      <div className="flex items-center justify-between">

        <p className="text-sm font-black text-[#092B5F]">
          {label}
        </p>

        <span className="text-slate-300 transition group-hover:text-[#0B3B82]">
          ↗
        </span>

      </div>

      <p className="mt-2 truncate text-xs text-slate-400">
        Connected
      </p>

    </a>
  )
}