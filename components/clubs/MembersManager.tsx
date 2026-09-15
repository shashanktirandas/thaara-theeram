'use client'

import { useEffect, useState } from 'react'

type Member = {
  id: string
  role: 'MEMBER' | 'COORDINATOR' | 'HEAD'
  status: 'ACTIVE' | 'INACTIVE'
  joined_at: string
  student: {
    id: string
    name: string
    roll_number: string
    department: string
    year: string
    section: string
    profile_photo_url: string | null
  }
}

type Props = {
  slug: string
}

type MeResponse = {
  isAdmin?: boolean
  memberships?: {
  clubs?: {
    slug: string
  }
  role: string
  status: string
}[]
}

function MemberRow({
  member,
  canManageRoles,
  onRoleChange,
  onRemoveMember,
  changingId,
}: {
  member: Member
  canManageRoles: boolean
  onRoleChange: (member: Member) => void
  onRemoveMember: (member: Member) => void
  changingId: string | null
}) {
  const nextRole =
    member.role === 'MEMBER' ? 'COORDINATOR' : 'MEMBER'

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-600">
          {member.student.profile_photo_url ? (
            <img
              src={member.student.profile_photo_url}
              alt={member.student.name}
              className="h-full w-full object-cover"
            />
          ) : (
            member.student.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-900">
            {member.student.name}
          </p>

          <p className="text-sm text-slate-500">
            {member.student.roll_number} · {member.student.department} ·{' '}
            {member.student.year} Year · Section {member.student.section}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            member.role === 'HEAD'
              ? 'bg-yellow-100 text-yellow-800'
              : member.role === 'COORDINATOR'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700'
          }`}
        >
          {member.role}
        </span>

        {canManageRoles && member.role !== 'HEAD' && (<>
          <button
            onClick={() => onRoleChange(member)}
            disabled={changingId === member.id}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingId === member.id
              ? 'Updating...'
              : `Make ${nextRole === 'COORDINATOR' ? 'Coordinator' : 'Member'}`}
          </button>
          <button
  type="button"
  onClick={() => onRemoveMember(member)}
  disabled={changingId === member.id}
  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  {changingId === member.id ? 'Removing...' : 'Remove'}
</button> </>
          
        )}
      </div>
    </div>
  )
}

export default function MembersManager({ slug }: Props) {
  const [members, setMembers] = useState<Member[]>([])
  const [canManageRoles, setCanManageRoles] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changingId, setChangingId] = useState<string | null>(null)

  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedCoordinator, setSelectedCoordinator] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferMessage, setTransferMessage] = useState('')

  const [addRollNumber, setAddRollNumber] = useState('')
const [addingMember, setAddingMember] = useState(false)
const [addMessage, setAddMessage] = useState('')


  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [membersResponse, meResponse] = await Promise.all([
        fetch(`/api/clubs/${slug}/members`),
        fetch('/api/auth/me'),
      ])

      const membersData = await membersResponse.json()
      const meData: MeResponse = await meResponse.json()

      if (!membersResponse.ok) {
        throw new Error(
          membersData.error || 'Failed to load members.'
        )
      }

      setMembers(membersData.members ?? [])

      const currentMembership = (meData.memberships ?? []).find(
        (membership) =>
          membership.clubs?.slug === slug &&
          membership.status === 'ACTIVE'
      )

      setCanManageRoles(
        meData.isAdmin === true ||
          currentMembership?.role === 'HEAD'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load members.'
      )
    } finally {
      setLoading(false)
    }
  }
async function addMember() {
  const rollNumber = addRollNumber.trim()

  if (!rollNumber) {
    setAddMessage('Enter a roll number.')
    return
  }

  setAddingMember(true)
  setAddMessage('')

  try {
    const response = await fetch(
      `/api/clubs/${slug}/members/add`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollNumber }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setAddMessage(data.error || 'Unable to add member.')
      return
    }

    setAddMessage(data.message)
    setAddRollNumber('')

    await loadData()
  } catch {
    setAddMessage('Something went wrong. Please try again.')
  } finally {
    setAddingMember(false)
  }
}
  async function handleRoleChange(member: Member) {
    const nextRole =
      member.role === 'MEMBER' ? 'COORDINATOR' : 'MEMBER'

    const confirmed = window.confirm(
      `Change ${member.student.name}'s role from ${member.role} to ${nextRole}?`
    )

    if (!confirmed) return

    try {
      setChangingId(member.id)
      setError('')

      const response = await fetch(
        `/api/clubs/${slug}/members/role`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId: member.id,
            newRole: nextRole,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to change member role.'
        )
      }

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to change member role.'
      )
    } finally {
      setChangingId(null)
    }
  }
  async function handleRemoveMember(member: Member) {
  const confirmed = window.confirm(
    `Remove ${member.student.name} (${member.student.roll_number}) from this club?`
  )

  if (!confirmed) return

  try {
    setChangingId(member.id)
    setError('')

    const response = await fetch(
      `/api/clubs/${slug}/members/remove`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.id,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Failed to remove member.'
      )
    }

    await loadData()
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to remove member.'
    )
  } finally {
    setChangingId(null)
  }
}  

  async function handleTransferHeadship() {
    if (!selectedCoordinator) {
      setTransferMessage('Please select a Coordinator.')
      return
    }

    const coordinator = members.find(
      (member) =>
        member.student.id === selectedCoordinator &&
        member.role === 'COORDINATOR'
    )

    if (!coordinator) {
      setTransferMessage('Selected Coordinator is not available.')
      return
    }

    const confirmed = window.confirm(
      `Send a Head transition request to ${coordinator.student.name}?`
    )

    if (!confirmed) return

    try {
      setTransferLoading(true)
      setTransferMessage('')

      const response = await fetch(
        `/api/clubs/${slug}/head-transition`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proposedHeadId: selectedCoordinator,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to send Head transition request.'
        )
      }

      setTransferMessage(
        data.message || 'Head transition request sent successfully.'
      )

      setSelectedCoordinator('')
    } catch (err) {
      setTransferMessage(
        err instanceof Error
          ? err.message
          : 'Failed to send Head transition request.'
      )
    } finally {
      setTransferLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [slug])

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Members
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Loading members...
        </p>
      </section>
    )
  }

  if (error && members.length === 0) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Members
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={loadData}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </section>
    )
  }

  const head = members.filter(
    (member) => member.role === 'HEAD'
  )

  const coordinators = members.filter(
    (member) => member.role === 'COORDINATOR'
  )

  const regularMembers = members.filter(
    (member) => member.role === 'MEMBER'
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Members
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {members.length} active member
            {members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {canManageRoles && (
  <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
    <div className="mb-4">
      <h3 className="text-lg font-bold text-slate-900">
        Add Member
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Add a student directly using their college roll number.
      </p>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={addRollNumber}
        onChange={(event) => setAddRollNumber(event.target.value)}
        placeholder="Enter roll number"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 sm:max-w-sm"
        disabled={addingMember}
      />

      <button
        type="button"
        onClick={addMember}
        disabled={addingMember}
        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {addingMember ? 'Adding...' : 'Add Member'}
      </button>
    </div>

    {addMessage && (
      <p className="mt-3 text-sm font-medium text-slate-600">
        {addMessage}
      </p>
    )}
  </div>
)}

      {/* HEAD */}
      {head.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-700">
                Head
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Club leadership
              </p>
            </div>

            {canManageRoles && coordinators.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowTransfer(!showTransfer)
                  setTransferMessage('')
                }}
                className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800 hover:bg-yellow-100"
              >
                {showTransfer
                  ? 'Cancel Transfer'
                  : 'Transfer Headship'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {head.map((member) => (
              <MemberRow
                key={`${member.role}-${member.student.id}`}
                member={member}
                canManageRoles={false}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
                changingId={changingId}
              />
            ))}
          </div>

          {/* TRANSFER PANEL */}
          {showTransfer && canManageRoles && (
            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-5">
              <h4 className="font-semibold text-slate-900">
                Transfer Club Headship
              </h4>

              <p className="mt-1 text-sm text-slate-600">
                Select an existing Coordinator. They will receive a
                request and must accept it before the leadership changes.
              </p>

              <select
                value={selectedCoordinator}
                onChange={(event) =>
                  setSelectedCoordinator(event.target.value)
                }
                className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Select a Coordinator
                </option>

                {coordinators.map((member) => (
                  <option
                    key={member.student.id}
                    value={member.student.id}
                  >
                    {member.student.name} — {member.student.roll_number}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleTransferHeadship}
                  disabled={
                    transferLoading || !selectedCoordinator
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {transferLoading
                    ? 'Sending...'
                    : 'Send Transfer Request'}
                </button>
              </div>

              {transferMessage && (
                <p className="mt-3 text-sm text-slate-700">
                  {transferMessage}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* COORDINATORS */}
      <div className="mt-8">
        <div className="mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700">
            Coordinators
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Students responsible for coordinating the club
          </p>
        </div>

        {coordinators.length > 0 ? (
          <div className="space-y-3">
            {coordinators.map((member) => (
              <MemberRow
                key={`${member.role}-${member.student.id}`}
                member={member}
                canManageRoles={canManageRoles}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
                changingId={changingId}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">
              No coordinators assigned.
            </p>
          </div>
        )}
      </div>

      {/* MEMBERS */}
      <div className="mt-8">
        <div className="mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Members
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Active club members
          </p>
        </div>

        {regularMembers.length > 0 ? (
          <div className="space-y-3">
            {regularMembers.map((member) => (
              <MemberRow
                key={`${member.role}-${member.student.id}`}
                member={member}
                canManageRoles={canManageRoles}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
                changingId={changingId}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">
              No regular members yet.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}