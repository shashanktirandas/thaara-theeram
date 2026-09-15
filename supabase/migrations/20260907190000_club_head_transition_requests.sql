create table public.club_head_transition_requests (
  id uuid primary key default gen_random_uuid(),

  club_id uuid not null
    references public.clubs(id) on delete restrict,

  current_head_id uuid not null
    references public.students(id) on delete restrict,

  proposed_head_id uuid not null
    references public.students(id) on delete restrict,

  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),

  requested_at timestamptz not null default now(),
  responded_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint different_head_students
    check (current_head_id <> proposed_head_id)
);
create index club_head_transition_requests_club_idx
on public.club_head_transition_requests (club_id, created_at desc);
create index club_head_transition_requests_proposed_head_idx
on public.club_head_transition_requests (proposed_head_id, status);
create unique index unique_pending_head_transition
on public.club_head_transition_requests (club_id)
where status = 'PENDING';
alter table public.club_head_transition_requests
enable row level security;
create trigger update_club_head_transition_requests_updated_at
before update on public.club_head_transition_requests
for each row
execute function public.set_updated_at();
