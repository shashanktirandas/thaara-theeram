'use client'

import { useEffect, useState } from 'react'

type Visibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'

type Announcement = {
  id: string
  title: string
  content: string
  visibility: Visibility
  created_at: string
  updated_at: string
  created_by: string
  creator?: {
    id: string
    name: string
    roll_number: string
  } | null
}

type Props = {
  slug: string
  canManage: boolean
}

const visibilityInfo: Record<
  Visibility,
  {
    label: string
    description: string
  }
> = {
  PUBLIC: {
    label: 'Public',
    description: 'Anyone visiting the club page can see this.',
  },
  MEMBERS_ONLY: {
    label: 'Members only',
    description:
      'Only active club members and management can see this.',
  },
  PRIVATE: {
    label: 'Private',
    description:
      'Only Head, Coordinators and Admins can see this.',
  },
}

export default function AnnouncementsManager({
  slug,
  canManage,
}: Props) {
  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([])

  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] =
    useState<Visibility>('PUBLIC')

  const [editingId, setEditingId] = useState<string | null>(
    null
  )

  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingVisibility, setEditingVisibility] =
    useState<Visibility>('PUBLIC')

  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  )

  const [message, setMessage] = useState('')

  async function loadAnnouncements() {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/clubs/${slug}/announcements`,
        { cache: 'no-store' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load announcements.'
        )
      }

      setAnnouncements(data.announcements ?? [])
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load announcements.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [slug])

  async function publishAnnouncement() {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setMessage('Enter an announcement title.')
      return
    }

    if (!trimmedContent) {
      setMessage('Enter announcement content.')
      return
    }

    try {
      setPublishing(true)
      setMessage('')

      const response = await fetch(
        `/api/clubs/${slug}/announcements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: trimmedTitle,
            content: trimmedContent,
            visibility,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to publish announcement.'
        )
      }

      setTitle('')
      setContent('')
      setVisibility('PUBLIC')
      setMessage('Announcement published successfully.')

      await loadAnnouncements()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to publish announcement.'
      )
    } finally {
      setPublishing(false)
    }
  }

  function startEditing(announcement: Announcement) {
    setEditingId(announcement.id)
    setEditingTitle(announcement.title)
    setEditingContent(announcement.content)
    setEditingVisibility(announcement.visibility)
    setMessage('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingTitle('')
    setEditingContent('')
    setEditingVisibility('PUBLIC')
  }

  async function saveEdit() {
    if (!editingId) return

    const trimmedTitle = editingTitle.trim()
    const trimmedContent = editingContent.trim()

    if (!trimmedTitle) {
      setMessage('Enter an announcement title.')
      return
    }

    if (!trimmedContent) {
      setMessage('Enter announcement content.')
      return
    }

    try {
      setSavingEdit(true)
      setMessage('')

      const response = await fetch(
        `/api/clubs/${slug}/announcements`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            title: trimmedTitle,
            content: trimmedContent,
            visibility: editingVisibility,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to update announcement.'
        )
      }

      cancelEditing()
      setMessage('Announcement updated successfully.')

      await loadAnnouncements()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update announcement.'
      )
    } finally {
      setSavingEdit(false)
    }
  }

  async function deleteAnnouncement(
    announcement: Announcement
  ) {
    const confirmed = window.confirm(
      `Delete "${announcement.title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(announcement.id)
      setMessage('')

      const response = await fetch(
        `/api/clubs/${slug}/announcements?id=${encodeURIComponent(
          announcement.id
        )}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to delete announcement.'
        )
      }

      if (editingId === announcement.id) {
        cancelEditing()
      }

      setMessage('Announcement deleted successfully.')

      await loadAnnouncements()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to delete announcement.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Announcements
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Keep your club community updated.
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {announcements.length} announcements
        </span>
      </div>

      {canManage && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">
            Publish Announcement
          </h3>

          <div className="mt-4 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Announcement title"
              maxLength={200}
              disabled={publishing}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your announcement..."
              rows={5}
              disabled={publishing}
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Who can see this?
              </label>

              <div className="mt-3 space-y-2">
                {(Object.keys(visibilityInfo) as Visibility[]).map(
                  (option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="announcement-visibility"
                        value={option}
                        checked={visibility === option}
                        onChange={() =>
                          setVisibility(option)
                        }
                        disabled={publishing}
                        className="mt-1"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {visibilityInfo[option].label}
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          {
                            visibilityInfo[option]
                              .description
                          }
                        </span>
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={publishAnnouncement}
              disabled={publishing}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing
                ? 'Publishing...'
                : 'Publish Announcement'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-slate-600">
          {message}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">
          Loading announcements...
        </p>
      ) : announcements.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-semibold text-slate-700">
            No announcements yet.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Published announcements will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {announcements.map((announcement) => {
            const isEditing =
              editingId === announcement.id

            return (
              <article
                key={announcement.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) =>
                        setEditingTitle(event.target.value)
                      }
                      maxLength={200}
                      disabled={savingEdit}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />

                    <textarea
                      value={editingContent}
                      onChange={(event) =>
                        setEditingContent(event.target.value)
                      }
                      rows={5}
                      disabled={savingEdit}
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />

                    <div>
                      <label className="text-sm font-semibold text-slate-900">
                        Who can see this?
                      </label>

                      <div className="mt-3 space-y-2">
                        {(
                          Object.keys(
                            visibilityInfo
                          ) as Visibility[]
                        ).map((option) => (
                          <label
                            key={option}
                            className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                          >
                            <input
                              type="radio"
                              name={`edit-visibility-${announcement.id}`}
                              value={option}
                              checked={
                                editingVisibility === option
                              }
                              onChange={() =>
                                setEditingVisibility(option)
                              }
                              disabled={savingEdit}
                              className="mt-1"
                            />

                            <span>
                              <span className="block text-sm font-semibold text-slate-900">
                                {
                                  visibilityInfo[option]
                                    .label
                                }
                              </span>

                              <span className="mt-1 block text-xs text-slate-500">
                                {
                                  visibilityInfo[option]
                                    .description
                                }
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={savingEdit}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingEdit
                          ? 'Saving...'
                          : 'Save Changes'}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={savingEdit}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {announcement.title}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {visibilityInfo[
                              announcement.visibility
                            ]?.label ?? announcement.visibility}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {announcement.creator?.name ??
                            'Club Management'}{' '}
                          ·{' '}
                          {new Date(
                            announcement.created_at
                          ).toLocaleString()}
                          {announcement.updated_at !==
                            announcement.created_at && (
                            <span> · Edited</span>
                          )}
                        </p>
                      </div>

                      {canManage && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(announcement)
                            }
                            disabled={
                              deletingId === announcement.id
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteAnnouncement(announcement)
                            }
                            disabled={
                              deletingId === announcement.id
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === announcement.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {announcement.content}
                    </p>
                  </>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}