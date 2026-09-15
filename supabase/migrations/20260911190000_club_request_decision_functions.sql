-- ============================================================
-- THAARA THEERAM
-- CLUB REQUEST APPROVAL / REJECTION
-- ============================================================

-- ------------------------------------------------------------
-- APPROVE CLUB REQUEST
--
-- Admin approves a pending request:
-- 1. Verify caller is the active admin
-- 2. Lock the request
-- 3. Create the club
-- 4. Make requester the initial HEAD
-- 5. Mark request APPROVED
-- 6. Create notification
-- 7. Write audit log
--
-- Everything happens in one transaction.
-- ------------------------------------------------------------

create or replace function public.approve_club_request(
  p_request_id uuid,
  p_admin_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.club_requests%rowtype;
  v_club public.clubs%rowtype;
  v_slug text;
  v_base_slug text;
  v_slug_suffix integer := 1;
  v_category text;
begin
  -- ----------------------------------------------------------
  -- SECURITY
  -- Do not trust the student id supplied by the API.
  -- It must belong to the currently authenticated user.
  -- ----------------------------------------------------------

  if public.current_student_id() is null
     or public.current_student_id() <> p_admin_student_id
     or not public.is_admin()
  then
    raise exception 'Only an active admin can approve club requests';
  end if;

  -- ----------------------------------------------------------
  -- Lock the request so two admins cannot approve it at once.
  -- ----------------------------------------------------------

  select *
  into v_request
  from public.club_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Club request not found';
  end if;

  if v_request.status <> 'PENDING' then
    raise exception 'Only pending club requests can be approved';
  end if;

  -- ----------------------------------------------------------
  -- Generate a permanent URL slug.
  -- Example:
  -- Photography Club -> photography-club
  -- If already used:
  -- photography-club-2
  -- photography-club-3
  -- ----------------------------------------------------------

  v_base_slug :=
    regexp_replace(
      lower(trim(v_request.club_name)),
      '[^a-z0-9]+',
      '-',
      'g'
    );

  v_base_slug := trim(both '-' from v_base_slug);

  if v_base_slug = '' then
    v_base_slug := 'club';
  end if;

  v_base_slug := left(v_base_slug, 70);
  v_slug := v_base_slug;

  while exists (
    select 1
    from public.clubs
    where slug = v_slug
  )
  loop
    v_slug_suffix := v_slug_suffix + 1;
    v_slug :=
      left(v_base_slug, 67)
      || '-'
      || v_slug_suffix::text;
  end loop;

  v_category := coalesce(nullif(trim(v_request.category), ''), 'Other');

  -- ----------------------------------------------------------
  -- CREATE CLUB
  -- ----------------------------------------------------------

  insert into public.clubs (
    name,
    slug,
    category,
    short_description,
    description,
    status
  )
  values (
    trim(v_request.club_name),
    v_slug,
    v_category,
    left(trim(v_request.description), 500),
    trim(v_request.description),
    'ACTIVE'
  )
  returning *
  into v_club;

  -- ----------------------------------------------------------
  -- REQUESTER BECOMES INITIAL HEAD
  -- ----------------------------------------------------------

  insert into public.club_members (
    club_id,
    student_id,
    role,
    status,
    joined_at
  )
  values (
    v_club.id,
    v_request.requested_by,
    'HEAD',
    'ACTIVE',
    now()
  );

  -- ----------------------------------------------------------
  -- MARK REQUEST APPROVED
  -- ----------------------------------------------------------

  update public.club_requests
  set
    status = 'APPROVED',
    reviewed_by = p_admin_student_id,
    reviewed_at = now(),
    updated_at = now()
  where id = v_request.id;

  -- ----------------------------------------------------------
  -- NOTIFICATION
  -- ----------------------------------------------------------

  insert into public.notifications (
    student_id,
    type,
    title,
    message
  )
  values (
    v_request.requested_by,
    'CLUB_REQUEST_APPROVED',
    'Club request approved',
    'Your club "' || v_club.name ||
    '" has been approved. You are now the initial Head.'
  );

  -- ----------------------------------------------------------
  -- AUDIT LOG
  -- ----------------------------------------------------------

  insert into public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_student_id,
    'APPROVE_CLUB_REQUEST',
    'CLUB_REQUEST',
    v_request.id,
    jsonb_build_object(
      'club_id', v_club.id,
      'club_name', v_club.name,
      'club_slug', v_club.slug,
      'initial_head_id', v_request.requested_by
    )
  );

  return jsonb_build_object(
    'request_id', v_request.id,
    'club_id', v_club.id,
    'club_name', v_club.name,
    'club_slug', v_club.slug,
    'head_id', v_request.requested_by
  );
end;
$$;


-- ------------------------------------------------------------
-- REJECT CLUB REQUEST
--
-- Admin rejects a pending request:
-- 1. Verify caller is active admin
-- 2. Lock request
-- 3. Mark REJECTED
-- 4. Notify requester
-- 5. Write audit log
-- ------------------------------------------------------------

create or replace function public.reject_club_request(
  p_request_id uuid,
  p_admin_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.club_requests%rowtype;
begin
  -- ----------------------------------------------------------
  -- SECURITY
  -- ----------------------------------------------------------

  if public.current_student_id() is null
     or public.current_student_id() <> p_admin_student_id
     or not public.is_admin()
  then
    raise exception 'Only an active admin can reject club requests';
  end if;

  -- ----------------------------------------------------------
  -- Lock request
  -- ----------------------------------------------------------

  select *
  into v_request
  from public.club_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Club request not found';
  end if;

  if v_request.status <> 'PENDING' then
    raise exception 'Only pending club requests can be rejected';
  end if;

  -- ----------------------------------------------------------
  -- MARK REJECTED
  -- ----------------------------------------------------------

  update public.club_requests
  set
    status = 'REJECTED',
    reviewed_by = p_admin_student_id,
    reviewed_at = now(),
    updated_at = now()
  where id = v_request.id;

  -- ----------------------------------------------------------
  -- NOTIFICATION
  -- ----------------------------------------------------------

  insert into public.notifications (
    student_id,
    type,
    title,
    message
  )
  values (
    v_request.requested_by,
    'CLUB_REQUEST_REJECTED',
    'Club request not approved',
    'Your request for "' || v_request.club_name ||
    '" was not approved. You can review it and submit again.'
  );

  -- ----------------------------------------------------------
  -- AUDIT LOG
  -- ----------------------------------------------------------

  insert into public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_student_id,
    'REJECT_CLUB_REQUEST',
    'CLUB_REQUEST',
    v_request.id,
    jsonb_build_object(
      'club_name', v_request.club_name,
      'requested_by', v_request.requested_by
    )
  );

  return jsonb_build_object(
    'request_id', v_request.id,
    'status', 'REJECTED'
  );
end;
$$;


-- ------------------------------------------------------------
-- RPC PERMISSIONS
-- ------------------------------------------------------------

revoke all on function public.approve_club_request(uuid, uuid)
from public;

revoke all on function public.reject_club_request(uuid, uuid)
from public;

grant execute on function public.approve_club_request(uuid, uuid)
to authenticated;

grant execute on function public.reject_club_request(uuid, uuid)
to authenticated;