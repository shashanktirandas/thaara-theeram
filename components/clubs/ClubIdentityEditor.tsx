'use client'

import { useState } from 'react'

type ClubIdentityEditorProps = {
  slug: string
  initialData: {
    name: string
    category: string | null
    tagline: string | null
    short_description: string | null
    description: string | null
    vision: string | null
    mission: string | null
    activities: string | null
    logo_url: string | null
    banner_url: string | null
    whatsapp_group_url: string | null
    instagram_url: string | null
    linkedin_url: string | null
    youtube_url: string | null
  }
}

export default function ClubIdentityEditor({
  slug,
  initialData,
}: ClubIdentityEditorProps) {
  const [form, setForm] = useState(initialData)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<
    'logo' | 'banner' | null
  >(null)
  const [message, setMessage] = useState('')

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(
        `/api/clubs/${slug}/identity`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to save club details.'
        )
      }

      setMessage('Club details saved successfully.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(
    file: File,
    type: 'logo' | 'banner'
  ) {
    setUploading(type)
    setMessage('')

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch(
        `/api/clubs/${slug}/identity/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to upload image.'
        )
      }

      if (type === 'logo') {
        setForm((current) => ({
          ...current,
          logo_url: data.url,
        }))
      } else {
        setForm((current) => ({
          ...current,
          banner_url: data.url,
        }))
      }

      setMessage(
        `${
          type === 'logo' ? 'Logo' : 'Banner'
        } uploaded successfully.`
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong.'
      )
    } finally {
      setUploading(null)
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    handleUpload(file, type)

    event.target.value = ''
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold text-slate-500">
          Club Identity
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          Shape your club&apos;s identity
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          These details appear on your public club page.
        </p>
      </div>

      <div className="mt-8 space-y-8">

        {/* Basic Identity */}
        <div>
          <h3 className="text-lg font-bold">
            Basic Identity
          </h3>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-semibold">
                Club Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  updateField('name', e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Club name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Category
              </label>

              <select
                value={form.category ?? ''}
                onChange={(e) =>
                  updateField('category', e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="">
                  Select category
                </option>
                <option value="Technical">
                  Technical
                </option>
                <option value="Cultural">
                  Cultural
                </option>
                <option value="Arts & Media">
                  Arts & Media
                </option>
                <option value="Sports">
                  Sports
                </option>
                <option value="Literary">
                  Literary
                </option>
                <option value="Social & Service">
                  Social & Service
                </option>
                <option value="Entrepreneurship">
                  Entrepreneurship
                </option>
                <option value="Academic">
                  Academic
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Tagline
              </label>

              <input
                value={form.tagline ?? ''}
                onChange={(e) =>
                  updateField('tagline', e.target.value)
                }
                maxLength={150}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="A short line that represents your club"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Short Description
              </label>

              <textarea
                value={form.short_description ?? ''}
                onChange={(e) =>
                  updateField(
                    'short_description',
                    e.target.value
                  )
                }
                rows={3}
                maxLength={250}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="A short introduction to your club"
              />

              <p className="mt-1 text-xs text-slate-400">
                Maximum 250 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Full Description
              </label>

              <textarea
                value={form.description ?? ''}
                onChange={(e) =>
                  updateField(
                    'description',
                    e.target.value
                  )
                }
                rows={7}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Tell students more about the club..."
              />
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-lg font-bold">
            Purpose & Direction
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Explain what your club stands for and where it
            wants to go.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-semibold">
                Vision
              </label>

              <textarea
                value={form.vision ?? ''}
                onChange={(e) =>
                  updateField('vision', e.target.value)
                }
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="What do you want this club to become?"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Mission
              </label>

              <textarea
                value={form.mission ?? ''}
                onChange={(e) =>
                  updateField('mission', e.target.value)
                }
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="What does your club do to achieve that vision?"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Activities
              </label>

              <textarea
                value={form.activities ?? ''}
                onChange={(e) =>
                  updateField(
                    'activities',
                    e.target.value
                  )
                }
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Workshops, competitions, events, sessions, projects..."
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-lg font-bold">
            Branding
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Use a clear logo and a wide banner that represent
            your club.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* Logo */}
            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-semibold">
                Club Logo
              </h4>

              <div className="mt-4 flex min-h-40 items-center justify-center rounded-xl bg-slate-50 p-5">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt={`${form.name} logo`}
                    className="h-32 w-32 rounded-2xl object-contain"
                  />
                ) : (
                  <p className="text-sm text-slate-400">
                    No logo uploaded
                  </p>
                )}
              </div>

              <label className="mt-4 block cursor-pointer rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50">
                {uploading === 'logo'
                  ? 'Uploading...'
                  : form.logo_url
                    ? 'Replace Logo'
                    : 'Upload Logo'}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) =>
                    handleFileChange(e, 'logo')
                  }
                />
              </label>

              <p className="mt-2 text-xs text-slate-400">
                PNG, JPEG or WebP · Maximum 5 MB
              </p>
            </div>

            {/* Banner */}
            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-semibold">
                Club Banner
              </h4>

              <div className="mt-4 flex min-h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {form.banner_url ? (
                  <img
                    src={form.banner_url}
                    alt={`${form.name} banner`}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <p className="text-sm text-slate-400">
                    No banner uploaded
                  </p>
                )}
              </div>

              <label className="mt-4 block cursor-pointer rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50">
                {uploading === 'banner'
                  ? 'Uploading...'
                  : form.banner_url
                    ? 'Replace Banner'
                    : 'Upload Banner'}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) =>
                    handleFileChange(e, 'banner')
                  }
                />
              </label>

              <p className="mt-2 text-xs text-slate-400">
                PNG, JPEG or WebP · Maximum 5 MB
              </p>
            </div>
          </div>
        </div>

        {/* Community */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-lg font-bold">
            Community & Social Links
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Add only the links your club actually uses.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">
                WhatsApp Community
              </label>

              <input
                value={form.whatsapp_group_url ?? ''}
                onChange={(e) =>
                  updateField(
                    'whatsapp_group_url',
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Instagram
              </label>

              <input
                value={form.instagram_url ?? ''}
                onChange={(e) =>
                  updateField(
                    'instagram_url',
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                LinkedIn
              </label>

              <input
                value={form.linkedin_url ?? ''}
                onChange={(e) =>
                  updateField(
                    'linkedin_url',
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                YouTube
              </label>

              <input
                value={form.youtube_url ?? ''}
                onChange={(e) =>
                  updateField(
                    'youtube_url',
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`text-sm ${
              message.includes('successfully')
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {message}
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </section>
  )
}