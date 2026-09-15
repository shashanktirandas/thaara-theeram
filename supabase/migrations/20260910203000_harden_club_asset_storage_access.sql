create or replace function public.can_manage_club_assets(p_club_slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.clubs c
    join public.club_members cm
      on cm.club_id = c.id
    join public.students s
      on s.id = cm.student_id
    where c.slug = p_club_slug
      and s.auth_user_id = auth.uid()
      and cm.status = 'ACTIVE'
      and cm.role = 'HEAD'
  )
  or exists (
    select 1
    from public.admin_roles ar
    join public.students s
      on s.id = ar.student_id
    where s.auth_user_id = auth.uid()
      and ar.status = 'ACTIVE'
  );
$$;

drop policy if exists "Club heads and admins can upload club assets"
on storage.objects;

drop policy if exists "Club heads and admins can update club assets"
on storage.objects;

drop policy if exists "Club heads and admins can delete club assets"
on storage.objects;


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