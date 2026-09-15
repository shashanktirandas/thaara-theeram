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
  v_slug text;
  v_base_slug text;
  v_club_id uuid;
  v_requester public.students%rowtype;
begin
  -- Verify the actor is an active Admin
  if not exists (
    select 1
    from public.admin_roles
    where student_id = p_admin_student_id
      and status = 'ACTIVE'
  ) then
    raise exception 'Only an active Admin can approve club requests.';
  end if;

  -- Lock the request and make sure it is still pending
  select *
  into v_request
  from public.club_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Club request not found.';
  end if;

  if v_request.status <> 'PENDING' then
    raise exception 'This club request has already been processed.';
  end if;

  -- Get requester
  select *
  into v_requester
  from public.students
  where id = v_request.requested_by;

  if not found then
    raise exception 'Requester student not found.';
  end if;

  -- Create a URL-safe slug
  v_base_slug := lower(
    regexp_replace(
      trim(v_request.club_name),
      '[^a-zA-Z0-9]+',
      '-',
      'g'
    )
  );

  v_base_slug := trim(both '-' from v_base_slug);

  v_slug := v_base_slug;

  -- Avoid slug collision
  if exists (
    select 1
    from public.clubs
    where slug = v_slug
  ) then
    v_slug := v_base_slug || '-' || left(p_request_id::text, 8);
  end if;

  -- Create the club
  insert into public.clubs (
    name,
    slug,
    category,
    short_description,
    description,
    status
  )
  values (
    v_request.club_name,
    v_slug,
    v_request.category,
    left(v_request.description, 250),
    v_request.description,
    'ACTIVE'
  )
  returning id into v_club_id;

  -- Requester automatically becomes the initial Head
  insert into public.club_members (
    club_id,
    student_id,
    role,
    status
  )
  values (
    v_club_id,
    v_request.requested_by,
    'HEAD',
    'ACTIVE'
  );

  -- Mark request approved
  update public.club_requests
  set
    status = 'APPROVED',
    reviewed_by = p_admin_student_id,
    reviewed_at = now(),
    updated_at = now()
  where id = p_request_id;

  -- Notify requester
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
    'Your request for "' || v_request.club_name ||
    '" has been approved. You are now the Head of the club.'
  );

  -- Audit
  insert into public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_student_id,
    'CLUB_REQUEST_APPROVED',
    'CLUB_REQUEST',
    p_request_id,
    jsonb_build_object(
      'club_id', v_club_id,
      'club_name', v_request.club_name,
      'category', v_request.category,
      'initial_head', v_requester.roll_number
    )
  );

  return jsonb_build_object(
    'success', true,
    'club_id', v_club_id,
    'slug', v_slug
  );
end;
$$;