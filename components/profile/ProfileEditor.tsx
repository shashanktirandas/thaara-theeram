'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
type Student = {
  id: string
  roll_number: string
  name: string
  college_email: string
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
  status: string
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

type ProfileResponse = {
  student: Student
  memberships: Membership[]
}

function displayRole(role: Membership['role']) {
  if (role === 'HEAD') return 'Head'
  if (role === 'COORDINATOR') return 'Coordinator'
  return 'Member'
}

function splitItems(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export default function ProfileEditor() {
  const [student, setStudent] = useState<Student | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])

  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [skills, setSkills] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadProfile() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/profile', {
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load profile.')
      }

      const result = data as ProfileResponse

      setStudent(result.student)
      setMemberships(result.memberships)

      setBio(result.student.bio ?? '')
      setInterests(result.student.interests.join(', '))
      setSkills(result.student.skills.join(', '))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio,
          interests: splitItems(interests),
          skills: splitItems(skills),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save profile.')
      }

      setStudent((current) =>
        current
          ? {
              ...current,
              bio: data.student.bio,
              interests: data.student.interests ?? [],
              skills: data.student.skills ?? [],
            }
          : current
      )

      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      setUploading(true)
      setError('')
      setMessage('')

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to upload photo.')
      }

      setStudent((current) =>
        current
          ? {
              ...current,
              profile_photo_url: data.profile_photo_url,
            }
          : current
      )

      setMessage('Profile photo updated.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to upload photo.'
      )
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-72 rounded bg-slate-200" />
            <div className="mt-10 h-40 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </main>
    )
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Profile unavailable
          </h1>
          <p className="mt-2 text-slate-600">
            We couldn't load your student profile.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Student Profile
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your profile
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Tell the Thaara Theeram community what you are interested in
            and what you can contribute.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">

          {/* Profile identity */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">

              <div className="relative">
                {student.profile_photo_url ? (
                  <img
                    src={student.profile_photo_url}
                    alt={student.name}
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-blue-50"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-50 text-4xl font-bold text-blue-700 ring-4 ring-blue-50">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full border-4 border-white bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-slate-800">
                  {uploading ? '...' : 'Change'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={uploadPhoto}
                    disabled={uploading}
                  />
                </label>
              </div>
                <Link
                    href={`/students/${encodeURIComponent(student.roll_number)}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
  View Public Profile
</Link>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                {student.name}
              </h2>

              <p className="mt-1 font-mono text-sm text-slate-500">
                {student.roll_number}
              </p>

              <div className="mt-5 grid w-full gap-3 text-left">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Department
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {student.department}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Year
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {student.year}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Section
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {student.section || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full rounded-2xl border border-slate-200 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  College Email
                </p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {student.college_email}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  College-controlled information
                </p>
              </div>
            </div>
          </section>

          {/* Editable information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                About you
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                You control this information.
              </p>
            </div>

            <form onSubmit={saveProfile} className="space-y-6">

              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Bio
                </label>

                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Tell people a little about yourself..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {bio.length}/500
                </p>
              </div>

              <div>
                <label
                  htmlFor="interests"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Interests
                </label>

                <input
                  id="interests"
                  value={interests}
                  onChange={(event) => setInterests(event.target.value)}
                  placeholder="Photography, AI, Design, Music"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate interests with commas.
                </p>
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Skills
                </label>

                <input
                  id="skills"
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="Java, React, Photography, Public Speaking"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate skills with commas.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>
        </div>

        {/* Clubs */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Your involvement
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Club memberships
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your roles are automatically derived from your active club
              memberships.
            </p>
          </div>

          {memberships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-700">
                No club memberships yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Explore clubs and find something that interests you.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {memberships.map((membership) => {
                if (!membership.clubs) return null

                return (
                  <a
                    key={membership.id}
                    href={`/clubs/${membership.clubs.slug}`}
                    className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {membership.clubs.logo_url ? (
                        <img
                          src={membership.clubs.logo_url}
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 font-bold text-blue-700">
                          {membership.clubs.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-slate-900 group-hover:text-blue-700">
                          {membership.clubs.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {membership.clubs.category}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {displayRole(membership.role)}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}