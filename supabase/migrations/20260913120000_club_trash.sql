-- ============================================================
-- CLUB TRASH / RECOVERY
-- ============================================================
--
-- Clubs are never immediately hard-deleted by the admin UI.
-- A trashed club remains recoverable for 7 days.
-- Permanent cleanup will be handled separately.
-- ============================================================

alter table public.clubs
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid
    references public.students(id) on delete set null;

-- ------------------------------------------------------------
-- STATUS
-- ------------------------------------------------------------
--
-- Existing ACTIVE / ARCHIVED clubs continue to work.
-- TRASHED is a temporary recovery state.
-- ------------------------------------------------------------

alter table public.clubs
  drop constraint if exists clubs_status_check;

alter table public.clubs
  add constraint clubs_status_check
  check (
    status in ('ACTIVE', 'ARCHIVED', 'TRASHED')
  );

-- ------------------------------------------------------------
-- CONSISTENCY
-- ------------------------------------------------------------

alter table public.clubs
  add constraint clubs_trash_fields_consistent
  check (
    (
      status = 'TRASHED'
      and deleted_at is not null
    )
    or
    (
      status <> 'TRASHED'
      and deleted_at is null
    )
  );

-- ------------------------------------------------------------
-- INDEX
-- ------------------------------------------------------------

create index if not exists clubs_deleted_at_idx
  on public.clubs(deleted_at)
  where deleted_at is not null;

-- ------------------------------------------------------------
-- DOCUMENTATION
-- ------------------------------------------------------------

comment on column public.clubs.deleted_at is
  'Timestamp when the club was moved to Trash. Trashed clubs are recoverable for 7 days.';

comment on column public.clubs.deleted_by is
  'Student account of the Platform Admin who moved the club to Trash.';