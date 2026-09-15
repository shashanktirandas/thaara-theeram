'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Student = {
  id: string
  roll_number: string
  name: string
  department: string
  year: string
  section: string | null
  profile_photo_url: string | null
  bio: string | null
  interests: string[]
  skills: string[]
}

type Membership = {
  id: string
  role: 'MEMBER' | 'COORDINATOR' | 'HEAD'
  joined_at: string
  clubs:
    | {
        id: string
        name: string
        slug: string
        category: string
        logo_url: string | null
        status: string
      }
    | null
}

function roleLabel(role: Membership['role']) {
  if (role === 'HEAD') return 'Head'
  if (role === 'COORDINATOR') return 'Coordinator'
  return 'Member'
}

export default function PublicStudentProfilePage() {
  const params = useParams<{ roll_number: string }>()

  const [student, setStudent] = useState<Student | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `/api/students/${encodeURIComponent(params.roll_number)}`,
          {
            cache: 'no-store',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Student not found.')
        }

        setStudent(data.student)
        setMemberships(data.memberships ?? [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Student not found.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (params.roll_number) {
      load()
    }
  }, [params.roll_number])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl animate-pulse rounded-3xl bg-white p-8">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-80 rounded bg-slate-200" />
          <div className="mt-10 h-48 rounded-2xl bg-slate-100" />
        </div>
      </main>
    )
  }

  if (!student || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Student not found
          </h1>

          <p className="mt-2 text-slate-500">
            This profile may not exist or may no longer be available.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Thaara Theeram
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          ← Thaara Theeram
        </Link>

        {/* Hero */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-slate-900 sm:h-40" />

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-16 flex flex-col gap-5 sm:-mt-20 sm:flex-row sm:items-end">

              {student.profile_photo_url ? (
                <img
                  src={student.profile_photo_url}
                  alt={student.name}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md sm:h-36 sm:w-36"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-4xl font-bold text-blue-700 shadow-md sm:h-36 sm:w-36">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="pb-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  {student.name}
                </h1>

                <p className="mt-1 font-mono text-sm text-slate-500">
                  {student.roll_number}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {student.department} · {student.year}
                  {student.section
                    ? ` · Section ${student.section}`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              About
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {student.bio || 'No bio added yet.'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Academic information
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Roll Number
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {student.roll_number}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Department
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {student.department}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Year
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {student.year}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Section
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {student.section || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Interests & skills
          </h2>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-700">
              Interests
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(student.interests ?? []).length > 0 ? (
                (student.interests ?? []).map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  No interests added.
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">
              Skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(student.skills ?? []).length > 0 ? (
                (student.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  No skills added.
                </span>
              )}
            </div>
          </div>
        </section>

                {/* Clubs */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Club involvement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Roles shown here come directly from active club memberships.
            </p>
          </div>

          {memberships.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              No active club memberships.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {memberships.map((membership) => {
                if (!membership.clubs) return null

                return (
                  <Link
                    key={membership.id}
                    href={`/clubs/${membership.clubs.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                  >
                    {membership.clubs.logo_url ? (
                      <img
                        src={membership.clubs.logo_url}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                        {membership.clubs.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 group-hover:text-blue-700">
                        {membership.clubs.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {membership.clubs.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {roleLabel(membership.role)}
                    </span>

                    <span className="text-sm text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                      →
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
        <p className="mt-8 text-center text-xs text-slate-400">
          Thaara Theeram · A home for every passion
        </p>
      </div>
    </main>
  )
}