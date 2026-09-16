// import Link from 'next/link'
// import { redirect } from 'next/navigation'
// import { createClient } from '@/lib/supabase/server'
// import LogoutButton from '@/components/auth/LogoutButton'
// import HeadshipTransferRequest from '@/components/dashboard/HeadshipTransferRequest'
// import AdminInvitation from '@/components/AdminInvitation'
// import NotificationBell from '@/components/notifications/NotificationBell'
// import ApplicationsManager from '@/components/clubs/ApplicationsManager'

// type Membership = {
//   role: 'MEMBER' | 'COORDINATOR' | 'HEAD'
//   status: string
//   clubs:
//     | {
//         id: string
//         name: string
//         slug: string
//         category: string | null
//         short_description: string | null
//         logo_url: string | null
//       }
//     | {
//         id: string
//         name: string
//         slug: string
//         category: string | null
//         short_description: string | null
//         logo_url: string | null
//       }[]
//     | null
// }

// type Application = {
//   id: string
//   status: string
//   submitted_at: string
//   clubs:
//     | {
//         id: string
//         name: string
//         slug: string
//         category: string | null
//         short_description: string | null
//         logo_url: string | null
//       }
//     | {
//         id: string
//         name: string
//         slug: string
//         category: string | null
//         short_description: string | null
//         logo_url: string | null
//       }[]
//     | null
// }

// type ClubRequest = {
//   id: string
//   club_name: string
//   category: string | null
//   description: string | null
//   reason: string | null
//   status: string
//   created_at: string
//   reviewed_at: string | null
// }

// function getClub(
//   clubs: Membership['clubs'] | Application['clubs']
// ) {
//   return Array.isArray(clubs) ? clubs[0] : clubs
// }

// function roleLabel(role: string) {
//   if (role === 'HEAD') return 'Head'
//   if (role === 'COORDINATOR') return 'Coordinator'
//   return 'Member'
// }

// function roleClasses(role: string) {
//   if (role === 'HEAD') {
//     return 'bg-amber-50 text-amber-700 border-amber-200'
//   }

//   if (role === 'COORDINATOR') {
//     return 'bg-blue-50 text-blue-700 border-blue-200'
//   }

//   return 'bg-slate-50 text-slate-600 border-slate-200'
// }

// export default async function DashboardPage() {
//   const supabase = await createClient()

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect('/login?returnTo=/dashboard')
//   }

//   const { data: student } = await supabase
//     .from('students')
//     .select(`
//       id,
//       name,
//       roll_number,
//       department,
//       year,
//       section,
//       profile_photo_url,
//       bio
//     `)
//     .eq('auth_user_id', user.id)
//     .single()

//   if (!student) {
//     redirect('/login')
//   }

//   const { data: memberships } = await supabase
//     .from('club_members')
//     .select(`
//       role,
//       status,
//       clubs (
//         id,
// name,
// slug,
// category,
// logo_url,
// short_description
//       )
//     `)
//     .eq('student_id', student.id)
//     .eq('status', 'ACTIVE')
//     .order('role', { ascending: true })

//   const { data: applications } = await supabase
//     .from('club_applications')
//     .select(`
//       id,
//       status,
//       submitted_at,
//       clubs (
//   id,
//   name,
//   slug,
//   category,
//   logo_url,
//   short_description
// )
//     `)
//     .eq('student_id', student.id)
//     .eq('status', 'PENDING')
//     .order('submitted_at', { ascending: false })

//   const { data: clubRequests } = await supabase
//     .from('club_requests')
//     .select(`
//       id,
//       club_name,
//       category,
//       description,
//       reason,
//       status,
//       created_at,
//       reviewed_at
//     `)
//     .eq('requested_by', student.id)
//     .order('created_at', { ascending: false })

//   const { data: adminRole } = await supabase
//     .from('admin_roles')
//     .select('status')
//     .eq('student_id', student.id)
//     .eq('status', 'ACTIVE')
//     .maybeSingle()
// const { data: pendingAdminInvitation } =
//   await supabase
//     .from('admin_roles')
//     .select('id, status, created_at')
//     .eq('student_id', student.id)
//     .eq('status', 'PENDING')
//     .maybeSingle()
//   const activeMemberships = (memberships ?? []) as Membership[]
//   const pendingApplications = (applications ?? []) as Application[]
//   const requests = (clubRequests ?? []) as ClubRequest[]

//   const isAdmin = !!adminRole
//   const hasHeadRole = activeMemberships.some(
//     (membership) => membership.role === 'HEAD'
//   )
//   const hasCoordinatorRole = activeMemberships.some(
//     (membership) => membership.role === 'COORDINATOR'
//   )

//   const leadershipClubs = activeMemberships.filter(
//     (membership) =>
//       membership.role === 'HEAD' ||
//       membership.role === 'COORDINATOR'
//   )

//   return (
//     <main className="min-h-screen bg-slate-50 text-slate-900">

//       {/* Header */}
//       <header className="border-b border-slate-200 bg-white">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
//           <Link
//             href="/"
//             className="text-xl font-bold tracking-tight"
//           >
//             Thaara Theeram
//           </Link>

//           <nav className="flex items-center gap-3 sm:gap-5">
//   <Link
//   href="/profile"
//   className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:block"
// >
//   Profile
// </Link>
//   <Link
//     href="/clubs"
//     className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:block"
//   >
//     Explore Clubs
//   </Link>

//   <Link
//     href="/requests/new"
//     className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 md:block"
//   >
//     Start a Club
//   </Link>

//   <NotificationBell />

//   {isAdmin && (
//     <Link
//       href="/admin"
//       className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
//     >
//       Admin
//     </Link>
//   )}

//   <LogoutButton />
// </nav>
//         </div>
//       </header>

//       <section className="mx-auto max-w-7xl px-6 py-10">

//         {/* Profile */}
//         <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//           <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

//             <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-bold">
//               {student.profile_photo_url ? (
//                 <img
//                   src={student.profile_photo_url}
//                   alt={student.name}
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 student.name.charAt(0).toUpperCase()
//               )}
//             </div>

//             <div className="min-w-0">
//               <p className="text-sm font-medium text-slate-500">
//                 Student Profile
//               </p>

//               <h1 className="mt-1 text-3xl font-bold tracking-tight">
//                 {student.name}
//               </h1>

//               <p className="mt-2 text-sm text-slate-600">
//                 {student.roll_number} · {student.department} ·{' '}
//                 {student.year} · Section {student.section}
//               </p>
//             </div>

//             {isAdmin && (
//               <div className="sm:ml-auto">
//                 <span className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
//                   Platform Admin
//                 </span>
//               </div>
//             )}
//           </div>

//           {student.bio && (
//             <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600">
//               {student.bio}
//             </p>
//           )}
//         </section>

//         {/* Capability overview */}
//         <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

//           <div className="rounded-2xl border border-slate-200 bg-white p-5">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//               Clubs
//             </p>
//             <p className="mt-2 text-2xl font-bold">
//               {activeMemberships.length}
//             </p>
//             <p className="mt-1 text-sm text-slate-500">
//               Active memberships
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-white p-5">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//               Applications
//             </p>
//             <p className="mt-2 text-2xl font-bold">
//               {pendingApplications.length}
//             </p>
//             <p className="mt-1 text-sm text-slate-500">
//               Awaiting review
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-white p-5">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//               Leadership
//             </p>
//             <p className="mt-2 text-2xl font-bold">
//               {leadershipClubs.length}
//             </p>
//             <p className="mt-1 text-sm text-slate-500">
//               Clubs you help lead
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-white p-5">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//               Requests
//             </p>
//             <p className="mt-2 text-2xl font-bold">
//               {requests.length}
//             </p>
//             <p className="mt-1 text-sm text-slate-500">
//               Club proposals
//             </p>
//           </div>

//         </section>

//         {/* Role capabilities */}
//         {(hasHeadRole || hasCoordinatorRole || isAdmin) && (
//           <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">

//             <div>
//               <p className="text-sm font-semibold text-blue-600">
//                 Your responsibilities
//               </p>

//               <h2 className="mt-1 text-2xl font-bold">
//                 Manage what you’re responsible for
//               </h2>

//               <p className="mt-2 text-sm text-slate-500">
//                 Your account can carry multiple responsibilities at the same time.
//               </p>
//             </div>

//             <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

//               {leadershipClubs.map((membership) => {
//                 const club = getClub(membership.clubs)

//                 if (!club) return null

//                 return (
//                   <div
//                     key={`${club.id}-${membership.role}`}
//                     className="rounded-2xl border border-slate-200 p-5"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div>
//                         <p className="font-semibold">
//                           {club.name}
//                         </p>

//                         <p className="mt-1 text-xs text-slate-500">
//                           {club.category || 'Club'}
//                         </p>
//                       </div>

//                       <span
//                         className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleClasses(
//                           membership.role
//                         )}`}
//                       >
//                         {roleLabel(membership.role)}
//                       </span>
//                     </div>

//                     <Link
//                       href={`/clubs/${club.slug}/manage`}
//                       className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
//                     >
//                       Manage Club
//                     </Link>

//                     {membership.role === 'HEAD' && (
//                       <div className="mt-3">
//                         <HeadshipTransferRequest
//                           slug={club.slug}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}

//               {isAdmin && (
//                 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
//                   <div>
//                     <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
//                       Platform Admin
//                     </span>

//                     <h3 className="mt-4 font-semibold">
//                       Platform Administration
//                     </h3>

//                     <p className="mt-2 text-sm leading-6 text-slate-500">
//                       Manage clubs, students, requests, and platform administration.
//                     </p>
//                   </div>

//                   <Link
//                     href="/admin"
//                     className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
//                   >
//                     Open Admin Dashboard
//                   </Link>
//                 </div>
//               )}

//             </div>
//           </section>
//         )}

//         {/* My Clubs */}
//         <section className="mt-12">

//           <div className="flex items-end justify-between">
//             <div>
//               <p className="text-sm font-semibold text-blue-600">
//                 Your communities
//               </p>

//               <h2 className="mt-1 text-2xl font-bold">
//                 My Clubs
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Every club and role connected to your account.
//               </p>
//             </div>

//             <span className="text-sm text-slate-500">
//               {activeMemberships.length} clubs
//             </span>
//           </div>

//           {activeMemberships.length > 0 ? (
//             <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

//               {activeMemberships.map((membership) => {
//                 const club = getClub(membership.clubs)

//                 if (!club) return null

//                 return (
//                   <div
//                     key={`${club.id}-${membership.role}`}
//                     className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
//                   >
//                     <Link href={`/clubs/${club.slug}`}>
//                       <div className="flex h-32 items-center justify-center bg-slate-100">
//                         {club.logo_url ? (
//                           <img
//                             src={club.logo_url}
//                             alt={club.name}
//                             className="h-20 w-20 object-contain"
//                           />
//                         ) : (
//                           <span className="text-3xl font-bold text-slate-400">
//                             {club.name.charAt(0)}
//                           </span>
//                         )}
//                       </div>
//                     </Link>

//                     <div className="p-5">
//                       <div className="flex items-start justify-between gap-3">
//                         <h3 className="font-semibold">
//                           {club.name}
//                         </h3>

//                         <span
//                           className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${roleClasses(
//                             membership.role
//                           )}`}
//                         >
//                           {roleLabel(membership.role)}
//                         </span>
//                       </div>

//                       <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
//                         {club.short_description ||
//                           'A Thaara Theeram club.'}
//                       </p>

//                       <div className="mt-5 flex gap-2">
//                         <Link
//                           href={`/clubs/${club.slug}`}
//                           className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-slate-50"
//                         >
//                           Open
//                         </Link>

//                         {(membership.role === 'HEAD' ||
//                           membership.role === 'COORDINATOR') && (
//                           <Link
//                             href={`/clubs/${club.slug}/manage`}
//                             className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
//                           >
//                             Manage
//                           </Link>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}

//             </div>
//           ) : (
//             <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
//               <p className="font-medium">
//                 You haven't joined any clubs yet.
//               </p>

//               <Link
//                 href="/"
//                 className="mt-3 inline-block text-sm font-semibold text-blue-600 underline"
//               >
//                 Discover clubs
//               </Link>
//             </div>
//           )}
//         </section>
//           {pendingAdminInvitation && (
//   <div className="mt-8">
//     <AdminInvitation />
//   </div>
// )}
// {/* Applications to my clubs
// {leadershipClubs.length > 0 && (
//   <section className="mt-12">
//     <div>
//       <p className="text-sm font-semibold text-blue-600">
//         Club management
//       </p>

//       <h2 className="mt-1 text-2xl font-bold">
//         Applications to Your Clubs
//       </h2>

//       <p className="mt-1 text-sm text-slate-500">
//         Review students who want to join the clubs you manage.
//       </p>
//     </div>

//     <div className="mt-6 space-y-6">
//       {leadershipClubs.map((membership) => {
//         const club = getClub(membership.clubs)

//         if (!club) return null

//         return (
//           <div
//             key={`${club.id}-${membership.role}`}
//             className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//           >
//             <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h3 className="text-lg font-bold">
//                   {club.name}
//                 </h3>

//                 <p className="mt-1 text-sm text-slate-500">
//                   You are the {roleLabel(membership.role)}
//                 </p>
//               </div>

//               <Link
//                 href={`/clubs/${club.slug}`}
//                 className="text-sm font-semibold text-blue-600 hover:underline"
//               >
//                 View Club →
//               </Link>
//             </div>

//             <ApplicationsManager slug={club.slug} />
//           </div>
//         )
//       })}
//     </div>
//   </section>
// )} */}
//         {/* Pending applications */}
//         <section className="mt-12">

//           <div>
//             <p className="text-sm font-semibold text-blue-600">
//               Club applications
//             </p>

//             <h2 className="mt-1 text-2xl font-bold">
//               Pending Applications
//             </h2>
//           </div>

//           {pendingApplications.length > 0 ? (
//             <div className="mt-6 space-y-3">

//               {pendingApplications.map((application) => {
//                 const club = getClub(application.clubs)

//                 if (!club) return null

//                 return (
//                   <Link
//                     key={application.id}
//                     href={`/clubs/${club.slug}`}
//                     className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
//                   >
//                     <div>
//                       <p className="font-semibold">
//                         {club.name}
//                       </p>

//                       <p className="mt-1 text-sm text-slate-500">
//                         {club.category || 'Club'}
//                       </p>
//                     </div>

//                     <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
//                       Pending
//                     </span>
//                   </Link>
//                 )
//               })}

//             </div>
//           ) : (
//             <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
//               <p className="text-sm text-slate-500">
//                 You don't have any pending applications.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Club requests */}
//         <section className="mt-12">

//           <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//               <p className="text-sm font-semibold text-blue-600">
//                 Build something new
//               </p>

//               <h2 className="mt-1 text-2xl font-bold">
//                 My Club Requests
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Track clubs you've requested to start.
//               </p>
//             </div>

//             <Link
//               href="/requests/new"
//               className="text-sm font-semibold text-blue-600 hover:text-blue-700"
//             >
//               Start a Club →
//             </Link>
//           </div>

//           {requests.length > 0 ? (
//             <div className="mt-6 space-y-4">

//               {requests.map((request, index) => {
//                 const statusClasses = {
//                   PENDING: 'bg-amber-50 text-amber-700',
//                   APPROVED: 'bg-emerald-50 text-emerald-700',
//                   REJECTED: 'bg-red-50 text-red-700',
//                 }

//                 const previousSameClub = requests
//                   .slice(0, index)
//                   .some(
//                     (item) =>
//                       item.club_name.trim().toLowerCase() ===
//                       request.club_name.trim().toLowerCase()
//                   )

//                 const isLatestRequest = !previousSameClub

//                 return (
//                   <div
//                     key={request.id}
//                     className="rounded-2xl border border-slate-200 bg-white p-5"
//                   >
//                     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

//                       <div>
//                         <h3 className="font-semibold">
//                           {request.club_name}
//                         </h3>

//                         {request.category && (
//                           <p className="mt-1 text-sm text-slate-500">
//                             {request.category}
//                           </p>
//                         )}

//                         <p className="mt-2 text-xs text-slate-400">
//                           Submitted{' '}
//                           {new Date(
//                             request.created_at
//                           ).toLocaleDateString('en-IN', {
//                             day: 'numeric',
//                             month: 'short',
//                             year: 'numeric',
//                           })}
//                         </p>
//                       </div>

//                       <div className="flex items-center gap-3">
//                         <span
//                           className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                             statusClasses[
//                               request.status as keyof typeof statusClasses
//                             ] || 'bg-slate-100 text-slate-600'
//                           }`}
//                         >
//                           {request.status}
//                         </span>

//                         {request.status === 'REJECTED' &&
//                           isLatestRequest && (
//                             <Link
//                               href={`/requests/new?reapply=${request.id}`}
//                               className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
//                             >
//                               Reapply
//                             </Link>
//                           )}
//                       </div>
//                     </div>

//                     {request.status === 'APPROVED' && (
//                       <p className="mt-4 text-sm font-medium text-emerald-700">
//                         Your club has been approved. You are the initial Head.
//                       </p>
//                     )}

//                     {request.status === 'PENDING' && (
//                       <p className="mt-4 text-sm text-slate-500">
//                         Your request is currently under Admin review.
//                       </p>
//                     )}

//                     {request.status === 'REJECTED' && (
//                       <p className="mt-4 text-sm text-red-600">
//                         {isLatestRequest
//                           ? 'This request was rejected. You can improve your proposal and apply again.'
//                           : 'This request was rejected and is kept here as part of your request history.'}
//                       </p>
//                     )}
//                   </div>
//                 )
//               })}

//             </div>
//           ) : (
//             <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
//               <p className="font-medium">
//                 You haven't requested a club yet.
//               </p>

//               <Link
//                 href="/requests/new"
//                 className="mt-3 inline-block text-sm font-semibold text-blue-600 underline"
//               >
//                 Start a new club
//               </Link>
//             </div>
//           )}
//         </section>

//       </section>

//       <footer className="mt-12 border-t border-slate-200 bg-white">
//         <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-500">
//           © 2026 Thaara Theeram
//         </div>
//       </footer>

//     </main>
//   )
// }

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import LogoutButton from '@/components/auth/LogoutButton'
import HeadshipTransferRequest from '@/components/dashboard/HeadshipTransferRequest'
import AdminInvitation from '@/components/AdminInvitation'
import NotificationBell from '@/components/notifications/NotificationBell'

type Membership = {
  role: 'MEMBER' | 'COORDINATOR' | 'HEAD'
  status: string
  clubs:
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }[]
    | null
}

type Application = {
  id: string
  status: string
  submitted_at: string
  clubs:
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }
    | {
        id: string
        name: string
        slug: string
        category: string | null
        short_description: string | null
        logo_url: string | null
      }[]
    | null
}

type ClubRequest = {
  id: string
  club_name: string
  category: string | null
  description: string | null
  reason: string | null
  status: string
  created_at: string
  reviewed_at: string | null
}

function getClub(
  clubs: Membership['clubs'] | Application['clubs']
) {
  return Array.isArray(clubs) ? clubs[0] : clubs
}

function roleLabel(role: string) {
  if (role === 'HEAD') return 'Head'
  if (role === 'COORDINATOR') return 'Coordinator'
  return 'Member'
}

function roleStyles(role: string) {
  if (role === 'HEAD') {
    return 'bg-[#FFF8DF] text-[#8A6500] border-[#F1D778]'
  }

  if (role === 'COORDINATOR') {
    return 'bg-[#EEF5FF] text-[#0B3B82] border-[#C9DDF8]'
  }

  return 'bg-slate-50 text-slate-600 border-slate-200'
}

function requestStatusStyles(status: string) {
  if (status === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  if (status === 'REJECTED') {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return 'bg-[#FFF8DF] text-[#8A6500] border-[#F1D778]'
}

function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
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

function ChevronIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
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

function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SparkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BriefcaseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnTo=/dashboard')
  }

  const { data: student } = await supabase
    .from('students')
    .select(`
      id,
      name,
      roll_number,
      department,
      year,
      section,
      profile_photo_url,
      bio
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!student) {
    redirect('/login')
  }

  const { data: memberships } = await supabase
    .from('club_members')
    .select(`
      role,
      status,
      clubs (
        id,
        name,
        slug,
        category,
        logo_url,
        short_description
      )
    `)
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .order('role', { ascending: true })

  const { data: applications } = await supabase
    .from('club_applications')
    .select(`
      id,
      status,
      submitted_at,
      clubs (
        id,
        name,
        slug,
        category,
        logo_url,
        short_description
      )
    `)
    .eq('student_id', student.id)
    .eq('status', 'PENDING')
    .order('submitted_at', { ascending: false })

  const { data: clubRequests } = await supabase
    .from('club_requests')
    .select(`
      id,
      club_name,
      category,
      description,
      reason,
      status,
      created_at,
      reviewed_at
    `)
    .eq('requested_by', student.id)
    .order('created_at', { ascending: false })

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('status')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const { data: pendingAdminInvitation } = await supabase
    .from('admin_roles')
    .select('id, status, created_at')
    .eq('student_id', student.id)
    .eq('status', 'PENDING')
    .maybeSingle()

  const activeMemberships = (memberships ?? []) as Membership[]
  const pendingApplications = (applications ?? []) as Application[]
  const requests = (clubRequests ?? []) as ClubRequest[]

  const isAdmin = !!adminRole

  const hasHeadRole = activeMemberships.some(
    (membership) => membership.role === 'HEAD'
  )

  const hasCoordinatorRole = activeMemberships.some(
    (membership) => membership.role === 'COORDINATOR'
  )

  const leadershipClubs = activeMemberships.filter(
    (membership) =>
      membership.role === 'HEAD' ||
      membership.role === 'COORDINATOR'
  )

  const attentionCount =
    pendingApplications.length +
    requests.filter((request) => request.status === 'PENDING').length +
    (pendingAdminInvitation ? 1 : 0)

  const firstName = student.name.split(' ')[0]

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-[#092B5F]">
      <style>{`
        @keyframes dashboardFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -5px, 0);
          }
        }

        .dashboard-entry {
          animation: dashboardFade 500ms ease-out both;
        }

        .dashboard-delay-1 {
          animation-delay: 70ms;
        }

        .dashboard-delay-2 {
          animation-delay: 140ms;
        }

        .dashboard-delay-3 {
          animation-delay: 210ms;
        }

        .dashboard-delay-4 {
          animation-delay: 280ms;
        }

        .dashboard-float {
          animation: dashboardFloat 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-entry,
          .dashboard-float {
            animation: none !important;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────── */}

      <header className="sticky top-0 z-40 border-b border-[#E2E8F0]/90 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B82]/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B3B82]">
              <img
                src="/brand/thaara-mark.png"
                alt=""
                className="h-full w-full object-contain p-1.5"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold tracking-[0.04em] text-[#092B5F]">
                THAARA THEERAM
              </p>
              <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:block">
                Clubs • People • Possibilities
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/clubs"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#092B5F] focus:outline-none focus:ring-2 focus:ring-[#0B3B82]/30 sm:inline-flex"
            >
              Clubs
            </Link>

            <Link
              href="/profile"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#092B5F] focus:outline-none focus:ring-2 focus:ring-[#0B3B82]/30 sm:inline-flex"
            >
              Profile
            </Link>

            <NotificationBell />

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-xl bg-[#092B5F] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0B3B82] focus:outline-none focus:ring-2 focus:ring-[#0B3B82]/30 md:inline-flex"
              >
                Admin
              </Link>
            )}

            <div className="ml-1 border-l border-[#E2E8F0] pl-1 sm:ml-2 sm:pl-2">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          PAGE
      ───────────────────────────────────────────── */}

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        {/* ───────────────────────────────────────────
            HERO / IDENTITY
        ─────────────────────────────────────────── */}

        <section className="dashboard-entry relative overflow-hidden rounded-[28px] bg-[#092B5F] px-6 py-8 text-white shadow-[0_18px_50px_rgba(9,43,95,0.13)] sm:px-9 sm:py-10 lg:px-11 lg:py-11">
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/10"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-36 right-20 h-72 w-72 rounded-full bg-[#0B3B82]/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 grid gap-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5C542]">
                Your Thaara Theeram
              </p>

              <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.035em] sm:text-[42px] lg:text-[48px]">
                Good to see you, {firstName}.
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-blue-100/80 sm:text-base">
                Your communities, responsibilities and next steps — all in
                one place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/clubs"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#092B5F] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  Explore clubs
                  <ArrowIcon size={16} />
                </Link>

                <Link
                  href="/profile"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition duration-200 hover:border-white/35 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  View profile
                </Link>
              </div>
            </div>

            <div className="dashboard-float hidden w-[245px] lg:block">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    {student.profile_photo_url ? (
                      <img
                        src={student.profile_photo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {student.name}
                    </p>
                    <p className="mt-0.5 text-xs text-blue-100/60">
                      {student.roll_number}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-100/50">
                    Campus identity
                  </p>

                  <p className="mt-2 text-sm text-blue-50">
                    {student.department}
                    <span className="mx-1.5 text-white/25">•</span>
                    {student.year}
                  </p>

                  <p className="mt-1 text-xs text-blue-100/55">
                    Section {student.section}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────
            ATTENTION STRIP
        ─────────────────────────────────────────── */}

        {attentionCount > 0 && (
          <section className="dashboard-entry dashboard-delay-1 mt-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-[#F1D778] bg-[#FFFDF2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5C542]/20 text-[#8A6500]">
                  <ClockIcon size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#092B5F]">
                    You have {attentionCount}{' '}
                    {attentionCount === 1 ? 'thing' : 'things'} to look at
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Pending applications, requests or account activity are
                    waiting for your attention.
                  </p>
                </div>
              </div>

              <Link
                href="#activity"
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0B3B82] transition hover:text-[#092B5F]"
              >
                Review
                <ArrowIcon size={14} />
              </Link>
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────
            PERSONAL SNAPSHOT
        ─────────────────────────────────────────── */}

        <section className="dashboard-entry dashboard-delay-1 mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B3B82]">
                Your place here
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#092B5F]">
                A quick snapshot
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#CBD8E8] hover:shadow-[0_10px_30px_rgba(9,43,95,0.06)]">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B3B82]">
                  <UsersIcon size={18} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Communities
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#092B5F]">
                {activeMemberships.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Active {activeMemberships.length === 1 ? 'club' : 'clubs'}
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#CBD8E8] hover:shadow-[0_10px_30px_rgba(9,43,95,0.06)]">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF8DF] text-[#8A6500]">
                  <ClockIcon size={18} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Waiting
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#092B5F]">
                {pendingApplications.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Pending applications
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#CBD8E8] hover:shadow-[0_10px_30px_rgba(9,43,95,0.06)]">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B3B82]">
                  <BriefcaseIcon size={18} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Leadership
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#092B5F]">
                {leadershipClubs.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Clubs you help lead
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#CBD8E8] hover:shadow-[0_10px_30px_rgba(9,43,95,0.06)]">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B3B82]">
                  <SparkIcon size={18} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Creation
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#092B5F]">
                {requests.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Club proposals
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────
            MY CLUBS
        ─────────────────────────────────────────── */}

        <section className="dashboard-entry dashboard-delay-2 mt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B3B82]">
                Your communities
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#092B5F]">
                My Clubs
              </h2>

              <p className="mt-1.5 text-sm text-slate-500">
                The communities you are part of.
              </p>
            </div>

            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B3B82] transition hover:text-[#092B5F]"
            >
              Discover more
              <ArrowIcon size={15} />
            </Link>
          </div>

          {activeMemberships.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMemberships.map((membership) => {
                const club = getClub(membership.clubs)

                if (!club) return null

                return (
                  <article
                    key={`${club.id}-${membership.role}`}
                    className="group overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white transition duration-250 hover:-translate-y-1 hover:border-[#CBD8E8] hover:shadow-[0_18px_45px_rgba(9,43,95,0.08)]"
                  >
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0B3B82]/40"
                    >
                      <div className="relative flex h-[145px] items-center justify-center overflow-hidden bg-[#F4F7FB]">
                        <div
                          className="absolute inset-0 opacity-60"
                          style={{
                            background:
                              'radial-gradient(circle at 50% 40%, rgba(11,59,130,0.08), transparent 58%)',
                          }}
                        />

                        {club.logo_url ? (
                          <img
                            src={club.logo_url}
                            alt={club.name}
                            className="relative h-20 w-20 object-contain transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B3B82] text-2xl font-semibold text-white">
                            {club.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/clubs/${club.slug}`}
                            className="line-clamp-1 text-[15px] font-semibold text-[#092B5F] transition hover:text-[#0B3B82]"
                          >
                            {club.name}
                          </Link>

                          <p className="mt-1 text-xs text-slate-400">
                            {club.category || 'Community'}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${roleStyles(
                            membership.role
                          )}`}
                        >
                          {roleLabel(membership.role)}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                        {club.short_description ||
                          'A community within Thaara Theeram.'}
                      </p>

                      <div className="mt-5 flex items-center gap-2">
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE4EE] px-3 text-xs font-semibold text-[#092B5F] transition hover:border-[#BFCFE3] hover:bg-[#F8FAFD]"
                        >
                          Open club
                          <ChevronIcon size={14} />
                        </Link>

                        {(membership.role === 'HEAD' ||
                          membership.role === 'COORDINATOR') && (
                          <Link
                            href={`/clubs/${club.slug}/manage`}
                            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[#0B3B82] px-3 text-xs font-semibold text-white transition hover:bg-[#092B5F]"
                          >
                            Manage
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-[#DCE4EE] bg-white">
              <div className="flex flex-col items-center px-6 py-12 text-center sm:py-14">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF5FF] text-[#0B3B82]">
                  <UsersIcon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#092B5F]">
                  Your first community is waiting.
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Explore clubs around campus and find a place where your
                  interests have people around them.
                </p>

                <Link
                  href="/clubs"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 text-sm font-semibold text-white transition hover:bg-[#092B5F]"
                >
                  Explore clubs
                  <ArrowIcon size={16} />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────
            RESPONSIBILITIES
        ─────────────────────────────────────────── */}

        {(hasHeadRole || hasCoordinatorRole || isAdmin) && (
          <section className="dashboard-entry dashboard-delay-2 mt-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B3B82]">
                What you carry
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#092B5F]">
                Your responsibilities
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                You can belong to several communities while carrying
                different responsibilities in each.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leadershipClubs.map((membership) => {
                const club = getClub(membership.clubs)

                if (!club) return null

                return (
                  <article
                    key={`${club.id}-${membership.role}`}
                    className="rounded-[22px] border border-[#DCE4EE] bg-white p-5 transition duration-200 hover:border-[#C6D5E7] hover:shadow-[0_12px_35px_rgba(9,43,95,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3F6FA]">
                          {club.logo_url ? (
                            <img
                              src={club.logo_url}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#0B3B82]">
                              {club.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#092B5F]">
                            {club.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {club.category || 'Club'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${roleStyles(
                          membership.role
                        )}`}
                      >
                        {roleLabel(membership.role)}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F8FAFD] px-3.5 py-3 text-xs text-slate-500">
                      <BriefcaseIcon size={15} />
                      <span>
                        {membership.role === 'HEAD'
                          ? 'You lead this community.'
                          : 'You help coordinate this community.'}
                      </span>
                    </div>

                    <Link
                      href={`/clubs/${club.slug}/manage`}
                      className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3B82] px-4 text-xs font-semibold text-white transition hover:bg-[#092B5F]"
                    >
                      Manage club
                      <ArrowIcon size={14} />
                    </Link>

                    {membership.role === 'HEAD' && (
                      <div className="mt-3">
                        <HeadshipTransferRequest slug={club.slug} />
                      </div>
                    )}
                  </article>
                )
              })}

              {isAdmin && (
                <article className="rounded-[22px] border border-[#DCE4EE] bg-[#092B5F] p-5 text-white">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#F5C542]">
                    <ShieldIcon size={20} />
                  </div>

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100/55">
                    Platform role
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    Platform Administration
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-100/65">
                    Your account has platform-level administration access.
                  </p>

                  <Link
                    href="/admin"
                    className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#092B5F] transition hover:bg-blue-50"
                  >
                    Open admin
                    <ArrowIcon size={14} />
                  </Link>
                </article>
              )}
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────
            ACTIVITY / PENDING
        ─────────────────────────────────────────── */}

        <section
          id="activity"
          className="dashboard-entry dashboard-delay-3 mt-12"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B3B82]">
              What needs attention
            </p>

            <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#092B5F]">
              Your activity
            </h2>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Pending applications */}

            <section className="rounded-[24px] border border-[#DCE4EE] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF8DF] text-[#8A6500]">
                    <ClockIcon size={17} />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[#092B5F]">
                    Pending applications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Clubs you've asked to join.
                  </p>
                </div>

                {pendingApplications.length > 0 && (
                  <span className="rounded-full bg-[#FFF8DF] px-2.5 py-1 text-[10px] font-semibold text-[#8A6500]">
                    {pendingApplications.length}
                  </span>
                )}
              </div>

              {pendingApplications.length > 0 ? (
                <div className="mt-6 divide-y divide-[#EEF2F6]">
                  {pendingApplications.map((application) => {
                    const club = getClub(application.clubs)

                    if (!club) return null

                    return (
                      <Link
                        key={application.id}
                        href={`/clubs/${club.slug}`}
                        className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3F6FA]">
                          {club.logo_url ? (
                            <img
                              src={club.logo_url}
                              alt=""
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-[#0B3B82]">
                              {club.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#092B5F] group-hover:text-[#0B3B82]">
                            {club.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {club.category || 'Club'} • Awaiting review
                          </p>
                        </div>

                        <ChevronIcon
                          size={16}
                        />
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-[#F8FAFD] px-4 py-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-emerald-600">
                      <CheckIcon size={17} />
                    </span>

                    <div>
                      <p className="text-sm font-medium text-[#092B5F]">
                        Nothing waiting here.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your club applications are all clear.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Club requests */}

            <section className="rounded-[24px] border border-[#DCE4EE] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B3B82]">
                    <SparkIcon size={17} />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[#092B5F]">
                    My club requests
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your journey to starting something new.
                  </p>
                </div>

                <Link
                  href="/requests/new"
                  className="hidden items-center gap-1 text-xs font-semibold text-[#0B3B82] sm:inline-flex"
                >
                  Start a club
                  <ArrowIcon size={13} />
                </Link>
              </div>

              {requests.length > 0 ? (
                <div className="mt-6 divide-y divide-[#EEF2F6]">
                  {requests.slice(0, 4).map((request, index) => {
                    const previousSameClub = requests
                      .slice(0, index)
                      .some(
                        (item) =>
                          item.club_name.trim().toLowerCase() ===
                          request.club_name.trim().toLowerCase()
                      )

                    const isLatestRequest = !previousSameClub

                    return (
                      <div
                        key={request.id}
                        className="py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-[#092B5F]">
                              {request.club_name}
                            </h4>

                            <p className="mt-1 text-xs text-slate-400">
                              {request.category || 'Community'} •{' '}
                              {new Date(
                                request.created_at
                              ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${requestStatusStyles(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        {request.status === 'APPROVED' && (
                          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-700">
                            Your club has been approved. You are the initial
                            Head.
                          </div>
                        )}

                        {request.status === 'PENDING' && (
                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            Your request is currently under Admin review.
                          </p>
                        )}

                        {request.status === 'REJECTED' && (
                          <div className="mt-3 flex flex-col gap-2 rounded-xl bg-red-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-red-700">
                              {isLatestRequest
                                ? 'You can improve your proposal and apply again.'
                                : 'This request is part of your request history.'}
                            </p>

                            {isLatestRequest && (
                              <Link
                                href={`/requests/new?reapply=${request.id}`}
                                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0B3B82] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#092B5F]"
                              >
                                Reapply
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-[#F8FAFD] px-4 py-5">
                  <p className="text-sm font-medium text-[#092B5F]">
                    Nothing created yet.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Have an idea for a community? You can start one here.
                  </p>

                  <Link
                    href="/requests/new"
                    className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0B3B82] px-3.5 text-xs font-semibold text-white transition hover:bg-[#092B5F]"
                  >
                    Start a club
                    <PlusIcon size={14} />
                  </Link>
                </div>
              )}

              {requests.length > 4 && (
                <p className="mt-5 text-xs text-slate-400">
                  Showing your latest 4 requests.
                </p>
              )}

              <Link
                href="/requests/new"
                className="mt-5 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#0B3B82] sm:hidden"
              >
                Start a club
                <ArrowIcon size={13} />
              </Link>
            </section>
          </div>
        </section>

        {/* ───────────────────────────────────────────
            ADMIN INVITATION
        ─────────────────────────────────────────── */}

        {pendingAdminInvitation && (
          <section className="dashboard-entry dashboard-delay-3 mt-8">
            <div className="overflow-hidden rounded-[24px] border border-[#DCE4EE] bg-white">
              <div className="border-b border-[#EEF2F6] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#092B5F] text-white">
                    <ShieldIcon size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#092B5F]">
                      Platform invitation
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      An administrator role has been offered to your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <AdminInvitation />
              </div>
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────
            START SOMETHING
        ─────────────────────────────────────────── */}

        <section className="dashboard-entry dashboard-delay-4 mt-14">
          <div className="relative overflow-hidden rounded-[28px] border border-[#DCE4EE] bg-white px-6 py-9 sm:px-9 sm:py-10">
            <div
              className="pointer-events-none absolute right-[-80px] top-[-100px] h-64 w-64 rounded-full bg-[#EEF5FF]"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute bottom-[-100px] right-[180px] h-52 w-52 rounded-full bg-[#FFF8DF]"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B82] text-white">
                <SparkIcon size={19} />
              </div>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B3B82]">
                Build something meaningful
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#092B5F] sm:text-3xl">
                Don't see your community yet?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Thaara Theeram grows with its students. If there is something
                you want to bring to campus, start the journey.
              </p>

              <Link
                href="/requests/new"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#092B5F] focus:outline-none focus:ring-2 focus:ring-[#0B3B82]/30"
              >
                Start a Club
                <ArrowIcon size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ─────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────── */}

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#092B5F]">
              THAARA THEERAM
            </p>

            <p className="mt-1 text-xs text-slate-400">
              A home for every passion.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link
              href="/clubs"
              className="transition hover:text-[#0B3B82]"
            >
              Clubs
            </Link>

            <Link
              href="/profile"
              className="transition hover:text-[#0B3B82]"
            >
              Profile
            </Link>

            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </main>
  )
}