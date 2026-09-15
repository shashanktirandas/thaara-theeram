-- ============================================================
-- APPLICATION NOTIFICATIONS — INCLUDE CLUB CONTEXT
-- ============================================================

create or replace function public.review_club_application(
  application_id uuid,
  decision text
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  application_row public.club_applications%rowtype;
  actor_student_id uuid;
  actor_is_admin boolean;
  actor_role text;
begin
  actor_student_id := public.current_student_id();

  if actor_student_id is null then
    raise exception 'Not authenticated';
  end if;

  if decision not in ('APPROVE', 'REJECT') then
    raise exception 'Invalid decision';
  end if;

  select *
  into application_row
  from public.club_applications
  where id = application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if application_row.status <> 'PENDING' then
    raise exception 'This application has already been reviewed';
  end if;

  actor_is_admin := public.is_admin();

  select role
  into actor_role
  from public.club_members
  where club_id = application_row.club_id
    and student_id = actor_student_id
    and status = 'ACTIVE'
    and role in ('HEAD', 'COORDINATOR')
  limit 1;

  if not actor_is_admin and actor_role is null then
    raise exception
      'You do not have permission to review applications for this club';
  end if;

  if decision = 'APPROVE' then

    insert into public.club_members (
      club_id,
      student_id,
      role,
      status,
      joined_at,
      left_at
    )
    values (
      application_row.club_id,
      application_row.student_id,
      'MEMBER',
      'ACTIVE',
      now(),
      null
    )
    on conflict (club_id, student_id)
    do update set
      role = 'MEMBER',
      status = 'ACTIVE',
      joined_at = now(),
      left_at = null,
      updated_at = now();

    update public.club_applications
    set
      status = 'APPROVED',
      reviewed_at = now(),
      reviewed_by = actor_student_id,
      updated_at = now()
    where id = application_row.id;

    -- Notify the applicant with the club context.
    insert into public.notifications (
      student_id,
      club_id,
      type,
      title,
      message
    )
    values (
      application_row.student_id,
      application_row.club_id,
      'CLUB_APPLICATION_APPROVED',
      'Club application approved',
      'Your application to join a club has been approved.'
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
      'CLUB_APPLICATION_APPROVED',
      'club_application',
      application_row.id,
      jsonb_build_object(
        'club_id', application_row.club_id,
        'student_id', application_row.student_id
      )
    );

  else

    update public.club_applications
    set
      status = 'REJECTED',
      reviewed_at = now(),
      reviewed_by = actor_student_id,
      updated_at = now()
    where id = application_row.id;

    -- Notify the applicant with the club context.
    insert into public.notifications (
      student_id,
      club_id,
      type,
      title,
      message
    )
    values (
      application_row.student_id,
      application_row.club_id,
      'CLUB_APPLICATION_REJECTED',
      'Club application update',
      'Your application to join a club was not approved.'
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
      'CLUB_APPLICATION_REJECTED',
      'club_application',
      application_row.id,
      jsonb_build_object(
        'club_id', application_row.club_id,
        'student_id', application_row.student_id
      )
    );

  end if;
end;
$function$;