-- ============================================================
-- Club Request Approval / Rejection
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_club_request(
  p_request_id uuid,
  p_admin_student_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.club_requests%ROWTYPE;
  v_club_id uuid;
  v_slug text;
  v_base_slug text;
  v_requester public.students%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE student_id = p_admin_student_id
      AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Only an active Admin can approve club requests';
  END IF;

  SELECT *
  INTO v_request
  FROM public.club_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Club request not found';
  END IF;

  IF v_request.status <> 'PENDING' THEN
    RAISE EXCEPTION 'This club request has already been reviewed';
  END IF;

  SELECT *
  INTO v_requester
  FROM public.students
  WHERE id = v_request.requested_by;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Requesting student not found';
  END IF;

  v_base_slug := lower(trim(v_request.club_name));
  v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9]+', '-', 'g');
  v_base_slug := trim(both '-' from v_base_slug);

  IF v_base_slug = '' THEN
    v_base_slug := 'club';
  END IF;

  v_slug := v_base_slug;

  IF EXISTS (
    SELECT 1
    FROM public.clubs
    WHERE slug = v_slug
  ) THEN
    v_slug := v_base_slug || '-' || substring(v_request.id::text, 1, 8);
  END IF;

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
  RETURNING id INTO v_club_id;

  INSERT INTO public.club_members (
    club_id,
    student_id,
    role,
    status
  )
  VALUES (
    v_club_id,
    v_request.requested_by,
    'HEAD',
    'ACTIVE'
  );

  UPDATE public.club_requests
  SET
    status = 'APPROVED',
    reviewed_by = p_admin_student_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.notifications (
    student_id,
    type,
    title,
    message
  )
  VALUES (
    v_request.requested_by,
    'CLUB_REQUEST_APPROVED',
    'Club Request Approved',
    'Your request for "' || v_request.club_name ||
    '" has been approved. You are now the Head of the club.'
  );

  INSERT INTO public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    p_admin_student_id,
    'CLUB_REQUEST_APPROVED',
    'CLUB_REQUEST',
    p_request_id,
    jsonb_build_object(
      'club_id', v_club_id,
      'club_name', v_request.club_name,
      'slug', v_slug,
      'initial_head', v_requester.roll_number
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'club_id', v_club_id,
    'slug', v_slug
  );
END;
$$;


-- ============================================================
-- Reject Club Request
-- ============================================================

CREATE OR REPLACE FUNCTION public.reject_club_request(
  p_request_id uuid,
  p_admin_student_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.club_requests%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE student_id = p_admin_student_id
      AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Only an active Admin can reject club requests';
  END IF;

  SELECT *
  INTO v_request
  FROM public.club_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Club request not found';
  END IF;

  IF v_request.status <> 'PENDING' THEN
    RAISE EXCEPTION 'This club request has already been reviewed';
  END IF;

  UPDATE public.club_requests
  SET
    status = 'REJECTED',
    reviewed_by = p_admin_student_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.notifications (
    student_id,
    type,
    title,
    message
  )
  VALUES (
    v_request.requested_by,
    'CLUB_REQUEST_REJECTED',
    'Club Request Rejected',
    'Your request for "' || v_request.club_name ||
    '" was not approved by the Admin team.'
  );

  INSERT INTO public.audit_logs (
    actor_student_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    p_admin_student_id,
    'CLUB_REQUEST_REJECTED',
    'CLUB_REQUEST',
    p_request_id,
    jsonb_build_object(
      'club_name', v_request.club_name
    )
  );

  RETURN jsonb_build_object(
    'success', true
  );
END;
$$;