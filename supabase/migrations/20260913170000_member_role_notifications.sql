create or replace function public.update_club_member_role(
  member_id uuid,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  member_row public.club_members%rowtype;
  actor_student_id uuid;
  club_name text;
begin
  actor_student_id := public.current_student_id();

  if actor_student_id is null then
    raise exception 'Not authenticated';
  end if;

  if new_role not in ('MEMBER', 'COORDINATOR') then
    raise exception 'Invalid role';
  end if;

  select *
  into member_row
  from public.club_members
  where id = member_id
  for update;

  if not found then
    raise exception 'Member not found';
  end if;

  if member_row.status <> 'ACTIVE' then
    raise exception 'This membership is not active';
  end if;

  -- Only the club Head or an active platform Admin
  -- can change member roles.
  if not public.is_admin()
     and not exists (
       select 1
       from public.club_members
       where club_id = member_row.club_id
         and student_id = actor_student_id
         and role = 'HEAD'
         and status = 'ACTIVE'
     )
  then
    raise exception 'Only the club Head or an Admin can change member roles';
  end if;

  -- The Head must never be changed through this function.
  if member_row.role = 'HEAD' then
    raise exception 'The Head role cannot be changed here';
  end if;

  select name
  into club_name
  from public.clubs
  where id = member_row.club_id;

  update public.club_members
  set
    role = new_role,
    updated_at = now()
  where id = member_id;

  -- Notify the affected student.
  insert into public.notifications (
    student_id,
    club_id,
    type,
    title,
    message
  )
  values (
    member_row.student_id,
    member_row.club_id,
    'CLUB_MEMBERSHIP',
    'Role updated — ' || coalesce(club_name, 'Club'),
    'Your role in ' || coalesce(club_name, 'the club') ||
      ' has been changed from ' || member_row.role ||
      ' to ' || new_role || '.'
  );

  insert into public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    actor_student_id,
    'CLUB_MEMBER_ROLE_CHANGED',
    'club_member',
    member_row.id,
    jsonb_build_object(
      'club_id', member_row.club_id,
      'student_id', member_row.student_id,
      'old_role', member_row.role,
      'new_role', new_role
    )
  );
end;
$function$;