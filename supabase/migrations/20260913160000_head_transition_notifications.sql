-- Add club context to Head transition response notifications.
-- Accept/reject are handled inside SECURITY DEFINER RPCs, so the
-- notifications must be created here rather than in the API routes.

create or replace function public.accept_club_head_transition(
  transition_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  request_row public.club_head_transition_requests%rowtype;
  caller_student_id uuid;
  club_name text;
begin
  caller_student_id := public.current_student_id();

  if caller_student_id is null then
    raise exception 'Not authenticated';
  end if;

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

  if request_row.proposed_head_id <> caller_student_id then
    raise exception 'Only the proposed Coordinator can accept this request';
  end if;

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

  select name
  into club_name
  from public.clubs
  where id = request_row.club_id;

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

  -- Notify the previous Head.
  insert into public.notifications (
    student_id,
    club_id,
    type,
    title,
    message
  )
  values (
    request_row.current_head_id,
    request_row.club_id,
    'HEAD_TRANSITION_ACCEPTED',
    'Head transition accepted — ' || coalesce(club_name, 'Club'),
    'Your Head transition request was accepted. The new Head of ' ||
      coalesce(club_name, 'the club') || ' has been updated.'
  );

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
$function$;


create or replace function public.reject_club_head_transition(
  transition_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  request_row public.club_head_transition_requests%rowtype;
  caller_student_id uuid;
  club_name text;
begin
  caller_student_id := public.current_student_id();

  if caller_student_id is null then
    raise exception 'Not authenticated';
  end if;

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

  if request_row.proposed_head_id <> caller_student_id then
    raise exception 'Only the proposed Head can reject this request';
  end if;

  select name
  into club_name
  from public.clubs
  where id = request_row.club_id;

  update public.club_head_transition_requests
  set
    status = 'REJECTED',
    responded_at = now(),
    updated_at = now()
  where id = transition_request_id;

  -- Notify the current Head.
  insert into public.notifications (
    student_id,
    club_id,
    type,
    title,
    message
  )
  values (
    request_row.current_head_id,
    request_row.club_id,
    'HEAD_TRANSITION_REJECTED',
    'Head transition declined — ' || coalesce(club_name, 'Club'),
    'Your Head transition request was declined by the proposed new Head.'
  );

  insert into public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    caller_student_id,
    'CLUB_HEAD_TRANSFER_REJECTED',
    'CLUB_HEAD_TRANSITION_REQUEST',
    transition_request_id,
    jsonb_build_object(
      'club_id', request_row.club_id,
      'current_head_id', request_row.current_head_id,
      'proposed_head_id', request_row.proposed_head_id
    )
  );
end;
$function$;