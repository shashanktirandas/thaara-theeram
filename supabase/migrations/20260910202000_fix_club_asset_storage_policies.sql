-- Helper used specifically by Storage RLS policies.
-- SECURITY DEFINER allows the policy to check the required
-- club/member records without being blocked by their RLS policies.

create or replace function public.can_manage_club_assets(
  p_club_slug text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.club_members cm
      join public.clubs c
        on c.id = cm.club_id
      where c.slug = p_club_slug
        and cm.student_id = public.current_student_id()
        and cm.role = 'HEAD'
        and cm.status = 'ACTIVE'
    );
$$;


-- Remove the previous policies.

drop policy if exists
  "Club heads and admins can upload club assets"
on storage.objects;

drop policy if exists
  "Club heads and admins can update club assets"
on storage.objects;

drop policy if exists
  "Club heads and admins can delete club assets"
on storage.objects;


-- Upload

create policy "Club heads and admins can upload club assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'club-assets'
  and public.can_manage_club_assets(
    (storage.foldername(name))[1]
  )
);


-- Replace

create policy "Club heads and admins can update club assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'club-assets'
  and public.can_manage_club_assets(
    (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'club-assets'
  and public.can_manage_club_assets(
    (storage.foldername(name))[1]
  )
);


-- Delete

create policy "Club heads and admins can delete club assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'club-assets'
  and public.can_manage_club_assets(
    (storage.foldername(name))[1]
  )
);