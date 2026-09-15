-- Create the public bucket for club logos and banners.
-- Only authenticated Club Heads / Platform Admins can upload,
-- replace, or delete files.

insert into storage.buckets (
  id,
  name,
  public,
  allowed_mime_types,
  file_size_limit
)
values (
  'club-assets',
  'club-assets',
  true,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ],
  5242880
)
on conflict (id) do update
set
  public = true,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ],
  file_size_limit = 5242880;


-- =========================================================
-- UPLOAD
-- =========================================================

create policy "Club heads and admins can upload club assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'club-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.club_members cm
      join public.clubs c
        on c.id = cm.club_id
      where cm.student_id = public.current_student_id()
        and cm.role = 'HEAD'
        and cm.status = 'ACTIVE'
        and (storage.foldername(name))[1] = c.slug
    )
  )
);


-- =========================================================
-- UPDATE / REPLACE
-- =========================================================

create policy "Club heads and admins can update club assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'club-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.club_members cm
      join public.clubs c
        on c.id = cm.club_id
      where cm.student_id = public.current_student_id()
        and cm.role = 'HEAD'
        and cm.status = 'ACTIVE'
        and (storage.foldername(name))[1] = c.slug
    )
  )
)
with check (
  bucket_id = 'club-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.club_members cm
      join public.clubs c
        on c.id = cm.club_id
      where cm.student_id = public.current_student_id()
        and cm.role = 'HEAD'
        and cm.status = 'ACTIVE'
        and (storage.foldername(name))[1] = c.slug
    )
  )
);


-- =========================================================
-- DELETE
-- =========================================================

create policy "Club heads and admins can delete club assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'club-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.club_members cm
      join public.clubs c
        on c.id = cm.club_id
      where cm.student_id = public.current_student_id()
        and cm.role = 'HEAD'
        and cm.status = 'ACTIVE'
        and (storage.foldername(name))[1] = c.slug
    )
  )
);