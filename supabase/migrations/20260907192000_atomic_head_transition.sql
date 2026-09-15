create or replace function public.accept_club_head_transition(
  transition_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.club_head_transition_requests%rowtype;
  caller_student_id uuid;
begin
  -- Identify the currently authenticated student.
  caller_student_id := public.current_student_id();

  if caller_student_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Lock the transition request so two accept attempts
  -- cannot modify it simultaneously.
  select *
  into request_row
  from public.club_head_transition_requests
  where id = transition_request_id
  for update;

  if not found then
    raise exception 'Head transition request not found';
  end if;

  if request_row.status <> 'PENDING' then
    raise exception 'This head transition request is no longer pending';
  end if;

  -- Only the proposed Coordinator can accept the request.
  if request_row.proposed_head_id <> caller_student_id then
    raise exception 'Only the proposed Coordinator can accept this request';
  end if;

  -- Verify that the proposed student is still an active Coordinator.
  if not exists (
    select 1
    from public.club_members
    where club_id = request_row.club_id
      and student_id = request_row.proposed_head_id
      and role = 'COORDINATOR'
      and status = 'ACTIVE'
  ) then
    raise exception 'The proposed Head is no longer an active Coordinator';
  end if;

  -- Verify that the original Head is still the active Head.
  if not exists (
    select 1
    from public.club_members
    where club_id = request_row.club_id
      and student_id = request_row.current_head_id
      and role = 'HEAD'
      and status = 'ACTIVE'
  ) then
    raise exception 'The current Head is no longer the active Head';
  end if;

  -- Transfer the role.
  update public.club_members
  set
    role = 'MEMBER',
    updated_at = now()
  where club_id = request_row.club_id
    and student_id = request_row.current_head_id
    and status = 'ACTIVE';

  update public.club_members
  set
    role = 'HEAD',
    updated_at = now()
  where club_id = request_row.club_id
    and student_id = request_row.proposed_head_id
    and status = 'ACTIVE';

  -- Mark the request as accepted.
  update public.club_head_transition_requests
  set
    status = 'ACCEPTED',
    responded_at = now(),
    updated_at = now()
  where id = request_row.id;

  -- Record the role transition.
  insert into public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    caller_student_id,
    'CLUB_HEAD_TRANSFER_ACCEPTED',
    'CLUB',
    request_row.club_id,
    jsonb_build_object(
      'previous_head_id', request_row.current_head_id,
      'new_head_id', request_row.proposed_head_id,
      'transition_request_id', request_row.id
    )
  );
end;
$$;
