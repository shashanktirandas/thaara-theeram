alter table public.notifications
add column if not exists club_id uuid
references public.clubs(id)
on delete cascade;

create index if not exists notifications_club_id_idx
on public.notifications(club_id);