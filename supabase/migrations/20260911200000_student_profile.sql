-- ============================================================
-- THAARA THEERAM — STUDENT PROFILE
-- ============================================================

-- ------------------------------------------------------------
-- PROFILE PHOTO STORAGE
-- Public because profile photos are intentionally public
-- on student profiles.
-- ------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'student-assets',
  'student-assets',
  true,
  5242880,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- STORAGE POLICIES
-- Upload/update/delete is handled through the server API
-- using the service role after verifying the student.
-- Public SELECT is intentional for public profile photos.
-- ------------------------------------------------------------

create policy "Public can view student profile photos"
on storage.objects
for select
using (
  bucket_id = 'student-assets'
);

-- ------------------------------------------------------------
-- STUDENT PROFILE UPDATE
-- Direct client updates remain disabled.
-- The server API performs authorization before updating.
-- ------------------------------------------------------------

-- No UPDATE policy is intentionally added here.
-- Sensitive profile mutations go through the server API.