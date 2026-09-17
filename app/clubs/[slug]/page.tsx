// import { notFound } from 'next/navigation'
// import { createClient } from '@/lib/supabase/server'
// import JoinClubButton from '@/components/clubs/JoinClubButton'
// import ShareClubButton from '@/components/clubs/ShareClubButton'
// import Link from 'next/link'
// import LeaveClubButton from '@/components/clubs/LeaveClubButton'

// type PageProps = {
//   params: Promise<{ slug: string }>
// }

// export default async function ClubPage({ params }: PageProps) {
//   const { slug } = await params

//   const supabase = await createClient()

//   // ─────────────────────────────────────────────
//   // CLUB
//   // ─────────────────────────────────────────────

//   const { data: club, error } = await supabase
//     .from('clubs')
//     .select(`
//       id,
//       name,
//       slug,
//       category,
//       tagline,
//       short_description,
//       description,
//       vision,
//       mission,
//       activities,
//       logo_url,
//       banner_url,
//       status,
//       whatsapp_group_url,
//       instagram_url,
//       linkedin_url,
//       youtube_url
//     `)
//     .eq('slug', slug)
//     .eq('status', 'ACTIVE')
//     .single()

//   if (error || !club) {
//     notFound()
//   }

//   // ─────────────────────────────────────────────
//   // CURRENT STUDENT
//   // ─────────────────────────────────────────────

//   let currentClubStatus:
//     | 'JOIN'
//     | 'PENDING'
//     | 'MEMBER'
//     | 'HEAD'
//     | 'COORDINATOR' = 'JOIN'
//   let isAdmin = false
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (user) {
//     const { data: student } = await supabase
//       .from('students')
//       .select('id')
//       .eq('auth_user_id', user.id)
//       .maybeSingle()

//     if (student) {
//       const { data: adminRole } = await supabase
//   .from('admin_roles')
//   .select('id')
//   .eq('student_id', student.id)
//   .eq('status', 'ACTIVE')
//   .maybeSingle()

// isAdmin = !!adminRole
//       const { data: membership } = await supabase
//         .from('club_members')
//         .select('role, status')
//         .eq('club_id', club.id)
//         .eq('student_id', student.id)
//         .maybeSingle()

//       if (membership?.status === 'ACTIVE') {
//         if (membership.role === 'HEAD') {
//           currentClubStatus = 'HEAD'
//         } else if (membership.role === 'COORDINATOR') {
//           currentClubStatus = 'COORDINATOR'
//         } else {
//           currentClubStatus = 'MEMBER'
//         }
//       } else {
//         const { data: application } = await supabase
//           .from('club_applications')
//           .select('status')
//           .eq('club_id', club.id)
//           .eq('student_id', student.id)
//           .eq('status', 'PENDING')
//           .maybeSingle()

//         if (application) {
//           currentClubStatus = 'PENDING'
//         }
//       }
//     }
//   }

//   // ─────────────────────────────────────────────
//   // PUBLIC MEMBERS
//   // ─────────────────────────────────────────────

//   const { data: publicMembers } = await supabase
//     .from('club_public_members')
//     .select(`
//       club_id,
//       role,
//       id,
//       name,
//       roll_number,
//       department,
//       year,
//       section,
//       profile_photo_url
//     `)
//     .eq('club_id', club.id)
//     .order('role', { ascending: true })

//   const members =
//     publicMembers?.map((member) => ({
//       role: member.role,
//       student: {
//         id: member.id,
//         name: member.name,
//         roll_number: member.roll_number,
//         department: member.department,
//         year: member.year,
//         section: member.section,
//         profile_photo_url: member.profile_photo_url,
//       },
//     })) ?? []

//   const head = members.find(
//     (member) => member.role === 'HEAD'
//   )

//   const coordinators = members.filter(
//     (member) => member.role === 'COORDINATOR'
//   )

//   // ─────────────────────────────────────────────
//   // ANNOUNCEMENTS
//   // ─────────────────────────────────────────────

//   const announcementVisibilities =
//     currentClubStatus === 'MEMBER' ||
//     currentClubStatus === 'HEAD' ||
//     currentClubStatus === 'COORDINATOR'
//       ? ['PUBLIC', 'MEMBERS_ONLY']
//       : ['PUBLIC']

//   const { data: announcements } = await supabase
//     .from('announcements')
//     .select(`
//       id,
//       title,
//       content,
//       visibility,
//       created_at,
//       updated_at
//     `)
//     .eq('club_id', club.id)
//     .in('visibility', announcementVisibilities)
//     .order('created_at', { ascending: false })
//     .limit(6)

//   // ─────────────────────────────────────────────
//   // PAGE
//   // ─────────────────────────────────────────────

//   return (
//     <main className="min-h-screen bg-white text-slate-900">

//       {/* ═══════════════════════════════════════
//           NAVIGATION
//       ═══════════════════════════════════════ */}

//       <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/90 backdrop-blur-xl">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

//           <Link
//             href="/"
//             className="text-lg font-black tracking-tight text-blue-700"
//           >
//             THAARA THEERAM
//           </Link>

//           <div className="flex items-center gap-5">

//             {user ? (
//               <>
//                 {(currentClubStatus === 'HEAD' ||
// currentClubStatus === 'COORDINATOR' ||
// isAdmin) && (
//                   <Link
//                     href={`/clubs/${club.slug}/manage`}
//                     className="hidden text-sm font-semibold text-blue-700 transition hover:text-blue-900 sm:block"
//                   >
//                     Manage Club
//                   </Link>
//                 )}

//                 <Link
//                   href="/dashboard"
//                   className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
//                 >
//                   Dashboard
//                 </Link>
//               </>
//             ) : (
//               <Link
//                 href={`/login?returnTo=/clubs/${club.slug}`}
//                 className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
//               >
//                 Login
//               </Link>
//             )}

//           </div>
//         </div>
//       </nav>


//       {/* ═══════════════════════════════════════
//           HERO
//       ═══════════════════════════════════════ */}

//       <section className="relative overflow-hidden bg-slate-950">

//         {club.banner_url && (
//           <img
//             src={club.banner_url}
//             alt=""
//             className="absolute inset-0 h-full w-full object-cover opacity-30"
//           />
//         )}

//         <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-950/90 to-slate-950/95" />

//         <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">

//           <div className="max-w-4xl">

//             {/* Logo */}

//             <div className="mb-8 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl">

//               {club.logo_url ? (
//                 <img
//                   src={club.logo_url}
//                   alt={`${club.name} logo`}
//                   className="h-full w-full object-contain"
//                 />
//               ) : (
//                 <span className="text-4xl font-black text-blue-700">
//                   {club.name.charAt(0)}
//                 </span>
//               )}

//             </div>


//             {/* Category */}

//             <div className="flex flex-wrap items-center gap-3">

//               <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
//                 {club.category || 'Student Club'}
//               </span>

//               <span className="text-sm text-slate-400">
//                 Pallavi Engineering College
//               </span>

//             </div>


//             {/* Name */}

//             <h1 className="mt-6 text-5xl font-black tracking-tight text-white md:text-7xl">
//               {club.name}
//             </h1>


//             {/* Tagline */}

//             {club.tagline && (
//               <p className="mt-4 text-xl font-medium text-yellow-300 md:text-2xl">
//                 {club.tagline}
//               </p>
//             )}


//             {/* Description */}

//             <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
//               {club.short_description}
//             </p>


//             {/* Actions */}

//             <div className="mt-10 flex flex-wrap items-center gap-4">

//               <JoinClubButton
//                 slug={club.slug}
//                 initialStatus={currentClubStatus}
//               />

//               {(currentClubStatus === 'MEMBER' ||
//                 currentClubStatus === 'COORDINATOR') && (
//                 <LeaveClubButton slug={club.slug} />
//               )}

//               <ShareClubButton
//                 clubName={club.name}
//                 slug={club.slug}
//                 shortDescription={club.short_description}
//                 clubLogoUrl={club.logo_url}
//               />

//             </div>

//           </div>
//         </div>
//       </section>


//       {/* ═══════════════════════════════════════
//           ABOUT
//       ═══════════════════════════════════════ */}

//       <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

//         <div className="grid gap-14 lg:grid-cols-[1.4fr_0.6fr]">

//           <div>

//             <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
//               About the club
//             </p>

//             <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
//               A place to learn, create and belong.
//             </h2>

//             <p className="mt-7 whitespace-pre-line text-lg leading-8 text-slate-600">
//               {club.description}
//             </p>

//           </div>


//           {/* Club snapshot */}

//           <div className="h-fit rounded-[2rem] border border-slate-200 bg-slate-50 p-8">

//             <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
//               Club
//             </p>

//             <h3 className="mt-3 text-2xl font-black">
//               {club.name}
//             </h3>

//             <div className="my-7 h-px bg-slate-200" />

//             <div>
//               <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
//                 Category
//               </p>

//               <p className="mt-2 font-semibold text-slate-800">
//                 {club.category || 'Student Club'}
//               </p>
//             </div>

//             <div className="mt-6">
//               <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
//                 People
//               </p>

//               <p className="mt-2 font-semibold text-slate-800">
//                 {members.length}{' '}
//                 {members.length === 1 ? 'person' : 'people'}
//               </p>
//             </div>

//           </div>

//         </div>

//       </section>


//       {/* ═══════════════════════════════════════
//           VISION / MISSION
//       ═══════════════════════════════════════ */}

//       {(club.vision || club.mission) && (
//         <section className="border-y border-slate-200 bg-slate-50">

//           <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">

//             <div className="mb-12">
//               <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
//                 What drives us
//               </p>

//               <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
//                 Purpose behind the passion.
//               </h2>
//             </div>


//             <div className="grid gap-6 md:grid-cols-2">

//               {club.vision && (
//                 <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">

//                   <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">
//                     Vision
//                   </p>

//                   <p className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-600">
//                     {club.vision}
//                   </p>

//                 </div>
//               )}


//               {club.mission && (
//                 <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">

//                   <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
//                     Mission
//                   </p>

//                   <p className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-600">
//                     {club.mission}
//                   </p>

//                 </div>
//               )}

//             </div>

//           </div>

//         </section>
//       )}


//       {/* ═══════════════════════════════════════
//           ACTIVITIES
//       ═══════════════════════════════════════ */}

//       {club.activities && (
//         <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

//           <div className="grid gap-12 md:grid-cols-[0.65fr_1.35fr]">

//             <div>

//               <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
//                 What we do
//               </p>

//               <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
//                 Experiences that bring people together.
//               </h2>

//             </div>


//             <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">

//               <p className="whitespace-pre-line text-lg leading-8 text-slate-600">
//                 {club.activities}
//               </p>

//             </div>

//           </div>

//         </section>
//       )}


//       {/* ═══════════════════════════════════════
//           ANNOUNCEMENTS
//       ═══════════════════════════════════════ */}

//       <section className="border-y border-slate-200 bg-slate-50">

//         <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">

//           <div className="mb-12">

//             <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
//               Latest updates
//             </p>

//             <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
//               What’s happening at {club.name}
//             </h2>

//             <p className="mt-5 max-w-2xl text-lg leading-7 text-slate-600">
//               Stay up to date with the latest news, activities and
//               opportunities from the club.
//             </p>

//           </div>


//           {announcements && announcements.length > 0 ? (

//             <div className="grid gap-6 md:grid-cols-2">

//               {announcements.map((announcement) => (

//                 <article
//                   key={announcement.id}
//                   className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
//                 >

//                   <div className="flex items-center justify-between gap-4">

//                     <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
//                       {new Date(
//                         announcement.created_at
//                       ).toLocaleDateString('en-IN', {
//                         day: 'numeric',
//                         month: 'short',
//                         year: 'numeric',
//                       })}
//                     </p>

//                     {announcement.visibility === 'MEMBERS_ONLY' && (
//                       <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
//                         Members only
//                       </span>
//                     )}

//                   </div>


//                   <h3 className="mt-5 text-xl font-black tracking-tight">
//                     {announcement.title}
//                   </h3>

//                   <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
//                     {announcement.content}
//                   </p>

//                   {announcement.updated_at !==
//                     announcement.created_at && (
//                     <p className="mt-5 text-xs text-slate-400">
//                       Edited
//                     </p>
//                   )}

//                 </article>

//               ))}

//             </div>

//           ) : (

//             <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

//               <p className="text-lg font-bold text-slate-700">
//                 No announcements yet
//               </p>

//               <p className="mt-2 text-sm text-slate-500">
//                 Check back soon for updates from {club.name}.
//               </p>

//             </div>

//           )}

//         </div>

//       </section>


//       {/* ═══════════════════════════════════════
//           PEOPLE
//       ═══════════════════════════════════════ */}

//       {(head || coordinators.length > 0) && (
//         <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">

//           <div className="mb-12">

//             <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
//               The people
//             </p>

//             <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
//               Meet the team.
//             </h2>

//             <p className="mt-5 max-w-2xl text-lg text-slate-600">
//               The students helping {club.name} grow and create
//               meaningful experiences.
//             </p>

//           </div>


//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

//             {/* Head */}

//             {head && (
//   <Link
//     href={`/students/${encodeURIComponent(
//       head.student?.roll_number ?? ''
//     )}`}
//     className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
//   >

//                 <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100">

//                   {head.student.profile_photo_url ? (
//                     <img
//                       src={head.student.profile_photo_url}
//                       alt={head.student.name}
//                       className="h-full w-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-2xl font-black text-blue-700">
//                       {head.student.name.charAt(0)}
//                     </span>
//                   )}

//                 </div>

//                 <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">
//                   Head
//                 </p>

//                 <h3 className="mt-2 text-xl font-black">
//                   {head.student.name}
//                 </h3>

//                 <p className="mt-2 text-sm text-slate-500">
//                   {head.student.roll_number}
//                 </p>

//                 <p className="mt-1 text-sm text-slate-500">
//                   {head.student.department} · {head.student.year}
//                 </p>
//                 <p className="mt-4 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
//                   View profile →
//                 </p>

//               </Link>
//             )}


//             {/* Coordinators */}

//             {coordinators.map((coordinator) => (

//               <Link
//                 key={coordinator.student.id}
//                 href={`/students/${encodeURIComponent(
//                   coordinator.student?.roll_number ?? ''
//                 )}`}
//                 className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
//               >

//                 <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100">

//                   {coordinator.student.profile_photo_url ? (
//                     <img
//                       src={coordinator.student.profile_photo_url}
//                       alt={coordinator.student.name}
//                       className="h-full w-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-2xl font-black text-blue-700">
//                       {coordinator.student.name.charAt(0)}
//                     </span>
//                   )}

//                 </div>

//                 <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
//                   Coordinator
//                 </p>

//                 <h3 className="mt-2 text-xl font-black">
//                   {coordinator.student.name}
//                 </h3>

//                 <p className="mt-2 text-sm text-slate-500">
//                   {coordinator.student.roll_number}
//                 </p>

//                 <p className="mt-1 text-sm text-slate-500">
//                   {coordinator.student.department} ·{' '}
//                   {coordinator.student.year}
//                 </p>
//                 <p className="mt-4 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
//                   View profile →
//                 </p>

//               </Link>

//             ))}

//           </div>

//         </section>
//       )}


//       {/* ═══════════════════════════════════════
//           COMMUNITY
//       ═══════════════════════════════════════ */}

//       <section className="px-6 pb-20 md:pb-24">

//         <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-blue-700">

//           <div className="relative px-8 py-14 md:px-14 md:py-16">

//             <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

//             <div className="relative">

//               <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
//                 Stay connected
//               </p>

//               <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
//                 Be part of {club.name}.
//               </h2>

//               <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
//                 Join the club community and stay connected with
//                 upcoming activities, opportunities and announcements.
//               </p>


//               <div className="mt-9 flex flex-wrap gap-3">

//                 {club.whatsapp_group_url && (
//                   <a
//                     href={club.whatsapp_group_url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
//                   >
//                     WhatsApp Community
//                   </a>
//                 )}

//                 {club.instagram_url && (
//                   <a
//                     href={club.instagram_url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
//                   >
//                     Instagram
//                   </a>
//                 )}

//                 {club.linkedin_url && (
//                   <a
//                     href={club.linkedin_url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
//                   >
//                     LinkedIn
//                   </a>
//                 )}

//                 {club.youtube_url && (
//                   <a
//                     href={club.youtube_url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
//                   >
//                     YouTube
//                   </a>
//                 )}

//               </div>

//             </div>
//           </div>

//         </div>

//       </section>


//       {/* ═══════════════════════════════════════
//           FOOTER
//       ═══════════════════════════════════════ */}

//       <footer className="border-t border-slate-200 bg-white">

//         <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between">

//           <div>

//             <p className="font-black tracking-tight text-slate-900">
//               THAARA THEERAM
//             </p>

//             <p className="mt-1 text-sm text-slate-500">
//               A home for every passion.
//             </p>

//             <p className="mt-1 text-xs text-slate-400">
//               Clubs • People • Possibilities
//             </p>

//           </div>

//           <div className="text-left md:text-right">

//             <p className="text-sm text-slate-500">
//               {club.name}
//             </p>

//             <p className="mt-1 text-xs text-slate-400">
//               Pallavi Engineering College
//             </p>

//             <p className="mt-2 text-xs text-slate-400">
//               © 2026 Thaara Theeram
//             </p>

//           </div>

//         </div>

//       </footer>

//     </main>
//   )
// }



import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JoinClubButton from '@/components/clubs/JoinClubButton'
import ShareClubButton from '@/components/clubs/ShareClubButton'
import LeaveClubButton from '@/components/clubs/LeaveClubButton'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ slug: string }>
}

type Member = {
  role: string
  student: {
    id: string
    name: string
    roll_number: string
    department: string | null
    year: string | null
    section: string | null
    profile_photo_url: string | null
  }
}

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
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

function ArrowLeft({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
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

function UsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="9.5"
        cy="7.5"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M17 11a3.5 3.5 0 1 0-1-6.86M21 20v-1.5a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MegaphoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 13.5h3l9 4V6.5l-9 4H4v3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 13.5 8.5 19H11l-1.5-5.5M19 9a3 3 0 0 1 0 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" />
    </svg>
  )
}

function LinkedinIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10v6M8 8v.01M12 16v-3.2a2.8 2.8 0 0 1 5.6 0V16M12 10v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function YoutubeIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20.2 8.2a2.4 2.4 0 0 0-1.7-1.7C17 6 12 6 12 6s-5 0-6.5.5a2.4 2.4 0 0 0-1.7 1.7C3.3 9.7 3.3 12 3.3 12s0 2.3.5 3.8a2.4 2.4 0 0 0 1.7 1.7C7 18 12 18 12 18s5 0 6.5-.5a2.4 2.4 0 0 0 1.7-1.7c.5-1.5.5-3.8.5-3.8s0-2.3-.5-3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m10 9.5 5 2.5-5 2.5v-5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c.7 1.2 1.6 2.1 2.8 2.7l.5-.5c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.3.6-.1.5-.4 1-.8 1.2-.4.2-1.2.2-2.1-.2-1.1-.4-2.4-1.2-3.5-2.3-1.1-1.1-1.9-2.4-2.3-3.5-.4-.9-.4-1.7-.2-2.1.2-.4.7-.7 1.1-.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function MemberAvatar({
  member,
  size = 'normal',
}: {
  member: Member
  size?: 'normal' | 'large'
}) {
  const initials = member.student.name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF4FB] font-black text-[#0B3B82]',
        size === 'large' ? 'h-20 w-20 text-xl' : 'h-14 w-14 text-sm',
      ].join(' ')}
    >
      {member.student.profile_photo_url ? (
        <img
          src={member.student.profile_photo_url}
          alt={member.student.name}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createClient()

  // ============================================================
  // CLUB
  // ============================================================

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

  // ============================================================
  // CURRENT STUDENT
  // ============================================================

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

  // ============================================================
  // PUBLIC MEMBERS
  // ============================================================

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

  const members: Member[] =
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

  // ============================================================
  // ANNOUNCEMENTS
  // ============================================================

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

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-[#F5C542]/30 selection:text-[#092B5F]">

      {/* ========================================================
          NAVIGATION
      ======================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/clubs"
            className="group inline-flex items-center gap-2.5 rounded-xl px-1 py-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-[#0B3B82]" />

            <span className="text-sm font-bold text-slate-500 transition-colors duration-200 group-hover:text-[#0B3B82]">
              Clubs
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {user ? (
              <>
                {(currentClubStatus === 'HEAD' ||
                  currentClubStatus === 'COORDINATOR' ||
                  isAdmin) && (
                  <Link
                    href={`/clubs/${club.slug}/manage`}
                    className="hidden rounded-lg px-2 py-2 text-sm font-bold text-[#0B3B82] transition-colors duration-200 hover:bg-blue-50 sm:block"
                  >
                    Manage Club
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#092F6A] hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href={`/login?returnTo=/clubs/${club.slug}`}
                className="rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#092F6A] hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/15"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO — CLUB IDENTITY
      ======================================================== */}

      <section className="relative isolate overflow-hidden bg-[#092B5F]">

        {club.banner_url && (
          <img
            src={club.banner_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(11,59,130,0.7),transparent_38%),linear-gradient(115deg,#092B5F_0%,#071F43_100%)]"
        />

        <div
          aria-hidden="true"
          className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#F5C542]/[0.07] blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">

          <div className="max-w-4xl">

            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-200/70 transition-colors duration-200 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Explore clubs
            </Link>

            <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end">

              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/15 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:h-28 sm:w-28">

                {club.logo_url ? (
                  <img
                    src={club.logo_url}
                    alt={`${club.name} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-4xl font-black text-[#0B3B82]">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                )}

              </div>

              <div className="pb-1">

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-[#F5C542] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#092B5F]">
                    {club.category || 'Student Club'}
                  </span>

                  <span className="text-xs font-medium text-blue-100/60">
                    Pallavi Engineering College
                  </span>
                </div>

                <h1 className="mt-4 text-[2.8rem] font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-[4.6rem]">
                  {club.name}
                </h1>
              </div>
            </div>

            {club.tagline && (
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#F5C542] sm:text-xl">
                {club.tagline}
              </p>
            )}

            {club.short_description && (
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-blue-100/70 sm:text-lg sm:leading-8">
                {club.short_description}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
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

      {/* ========================================================
          QUICK CONTEXT
      ======================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">

          <div className="flex items-center gap-4 py-5 sm:px-6 sm:first:pl-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFD] text-[#0B3B82]">
              <UsersIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-[#092B5F]">
                {members.length}
              </p>
              <p className="text-xs text-slate-400">
                {members.length === 1 ? 'Member' : 'Members'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-5 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFD] text-[#0B3B82]">
              <MegaphoneIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-[#092B5F]">
                {announcements?.length ?? 0}
              </p>
              <p className="text-xs text-slate-400">
                Recent updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-5 sm:px-6 sm:last:pr-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#B68100]">
              <span className="text-sm font-black">✦</span>
            </div>

            <div>
              <p className="text-sm font-black text-[#092B5F]">
                {club.category || 'Student Club'}
              </p>
              <p className="text-xs text-slate-400">
                Community
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          ABOUT
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20">

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F0B900]">
              About the club
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] text-[#092B5F] sm:text-4xl lg:text-5xl">
              A place to learn,
              <br className="hidden sm:block" />
              create and belong.
            </h2>

            {club.description ? (
              <p className="mt-7 max-w-3xl whitespace-pre-line text-[15px] leading-8 text-slate-600 sm:text-lg">
                {club.description}
              </p>
            ) : (
              <p className="mt-7 max-w-3xl text-[15px] leading-8 text-slate-500">
                Discover what this community is about and find
                your place within it.
              </p>
            )}
          </div>

          <aside className="h-fit rounded-[1.75rem] border border-slate-200/80 bg-[#F8FAFD] p-6 sm:p-7">

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Club snapshot
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                {club.logo_url ? (
                  <img
                    src={club.logo_url}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="font-black text-[#0B3B82]">
                    {club.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-black text-[#092B5F]">
                  {club.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {club.category || 'Student Club'}
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-slate-200" />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  People
                </p>
                <p className="mt-1.5 text-lg font-black text-[#092B5F]">
                  {members.length}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Category
                </p>
                <p className="mt-1.5 truncate text-sm font-bold text-[#092B5F]">
                  {club.category || 'Other'}
                </p>
              </div>
            </div>
          </aside>

        </div>
      </section>

      {/* ========================================================
          VISION / MISSION
      ======================================================== */}

      {(club.vision || club.mission) && (
        <section className="border-y border-slate-200 bg-[#F8FAFD]">

          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0B3B82]">
                What drives us
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#092B5F] sm:text-4xl">
                Purpose behind the passion.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">

              {club.vision && (
                <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F0B900]">
                      Vision
                    </p>

                    <span className="text-xl font-black text-[#F5C542]">
                      01
                    </span>
                  </div>

                  <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                    {club.vision}
                  </p>
                </article>
              )}

              {club.mission && (
                <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B3B82]">
                      Mission
                    </p>

                    <span className="text-xl font-black text-[#0B3B82]/20">
                      02
                    </span>
                  </div>

                  <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                    {club.mission}
                  </p>
                </article>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          ACTIVITIES
      ======================================================== */}

      {club.activities && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F0B900]">
                What we do
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-[#092B5F] sm:text-4xl">
                Experiences that bring people together.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                The activities, projects and experiences that
                make this community what it is.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-7 sm:p-9">
              <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600 sm:text-lg">
                {club.activities}
              </p>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================
          ANNOUNCEMENTS
      ======================================================== */}

      <section className="border-y border-slate-200 bg-[#F8FAFD]">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0B3B82]">
                Latest updates
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#092B5F] sm:text-4xl">
                What’s happening.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                News, activities and opportunities from {club.name}.
              </p>
            </div>

            {announcements && announcements.length > 0 && (
              <span className="text-xs font-bold text-slate-400">
                {announcements.length} recent{' '}
                {announcements.length === 1
                  ? 'update'
                  : 'updates'}
              </span>
            )}

          </div>

          <div className="mt-10">

            {announcements && announcements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">

                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="group rounded-[1.65rem] border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0B3B82]/15 hover:shadow-[0_16px_40px_rgba(9,43,95,0.07)] sm:p-7"
                  >

                    <div className="flex items-center justify-between gap-4">
                      <time className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {formatDate(announcement.created_at)}
                      </time>

                      {announcement.visibility === 'MEMBERS_ONLY' && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#9A7100]">
                          Members only
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-[#092B5F]">
                      {announcement.title}
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {announcement.content}
                    </p>

                    {announcement.updated_at !==
                      announcement.created_at && (
                      <p className="mt-5 text-[10px] font-medium text-slate-400">
                        Edited
                      </p>
                    )}

                  </article>
                ))}

              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFD] text-slate-400">
                  <MegaphoneIcon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-base font-extrabold text-[#092B5F]">
                  Nothing announced yet.
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Check back soon for updates from {club.name}.
                </p>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* ========================================================
          PEOPLE
      ======================================================== */}

      {(head || coordinators.length > 0) && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F0B900]">
              The people
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#092B5F] sm:text-4xl">
              Meet the people behind it.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              Students helping {club.name} grow, create and bring
              people together.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {head && (
              <Link
                href={`/students/${encodeURIComponent(
                  head.student.roll_number
                )}`}
                className="group rounded-[1.65rem] border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F5C542]/50 hover:shadow-[0_18px_45px_rgba(9,43,95,0.08)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
              >

                <div className="flex items-start justify-between">
                  <MemberAvatar member={head} size="large" />

                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#9A7100]">
                    Head
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-black tracking-[-0.02em] text-[#092B5F]">
                  {head.student.name}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  {head.student.roll_number}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {head.student.department}
                  {head.student.year
                    ? ` · ${head.student.year}`
                    : ''}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#0B3B82] opacity-70 transition-all duration-200 group-hover:opacity-100">
                  View profile
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>

              </Link>
            )}

            {coordinators.map((coordinator) => (
              <Link
                key={coordinator.student.id}
                href={`/students/${encodeURIComponent(
                  coordinator.student.roll_number
                )}`}
                className="group rounded-[1.65rem] border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#0B3B82]/20 hover:shadow-[0_18px_45px_rgba(9,43,95,0.08)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3B82]/10"
              >

                <div className="flex items-start justify-between">
                  <MemberAvatar member={coordinator} size="large" />

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#0B3B82]">
                    Coordinator
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-black tracking-[-0.02em] text-[#092B5F]">
                  {coordinator.student.name}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  {coordinator.student.roll_number}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {coordinator.student.department}
                  {coordinator.student.year
                    ? ` · ${coordinator.student.year}`
                    : ''}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#0B3B82] opacity-70 transition-all duration-200 group-hover:opacity-100">
                  View profile
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>

              </Link>
            ))}

          </div>
        </section>
      )}

      {/* ========================================================
          COMMUNITY / SOCIAL
      ======================================================== */}

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#092B5F]">

          <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">

            <div
              aria-hidden="true"
              className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#0B3B82] blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-20 left-1/2 h-40 w-40 rounded-full bg-[#F5C542]/10 blur-3xl"
            />

            <div className="relative max-w-3xl">

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F5C542]">
                Stay connected
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Be part of {club.name}.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/70 sm:text-base">
                Join the community and stay connected with upcoming
                activities, opportunities and announcements.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                {club.whatsapp_group_url && (
                  <a
                    href={club.whatsapp_group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#092B5F] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFD] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-emerald-600" />
                    WhatsApp
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}

                {club.instagram_url && (
                  <a
                    href={club.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                )}

                {club.linkedin_url && (
                  <a
                    href={club.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  >
                    <LinkedinIcon className="h-5 w-5" />
                  </a>
                )}

                {club.youtube_url && (
                  <a
                    href={club.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  >
                    <YoutubeIcon className="h-5 w-5" />
                  </a>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="border-t border-slate-200/80 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B3B82] text-sm font-black text-white">
                T
              </span>

              <span className="font-black tracking-[-0.02em] text-[#0B3B82]">
                THAARA THEERAM
              </span>
            </Link>

            <p className="mt-2 text-xs text-slate-400">
              A home for every passion.
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Clubs • People • Possibilities
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm font-semibold text-slate-500">
              {club.name}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pallavi Engineering College
            </p>

            <p className="mt-2 text-[10px] text-slate-400">
              © 2026 Thaara Theeram
            </p>
          </div>

        </div>
      </footer>

    </main>
  )
}