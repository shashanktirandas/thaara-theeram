-- Remember whether a club was ACTIVE or ARCHIVED before it was moved to Trash.
-- This allows Restore to return the club to its previous state.

alter table public.clubs
  add column if not exists status_before_trash text;

alter table public.clubs
  add constraint clubs_status_before_trash_check
  check (
    status_before_trash is null
    or status_before_trash in ('ACTIVE', 'ARCHIVED')
  );

alter table public.clubs
  add constraint clubs_trash_restore_state_consistent
  check (
    (
      status = 'TRASHED'
      and status_before_trash in ('ACTIVE', 'ARCHIVED')
    )
    or
    (
      status <> 'TRASHED'
      and status_before_trash is null
    )
  );

comment on column public.clubs.status_before_trash is
  'The club status immediately before it was moved to Trash. Used to restore the club to its previous state.';