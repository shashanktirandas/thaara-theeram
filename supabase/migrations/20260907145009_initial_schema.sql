-- ============================================================
-- THAARA THEERAM — INITIAL DATABASE SCHEMA
-- ============================================================

-- ------------------------------------------------------------
-- STUDENTS
-- One record per student.
-- Authentication/passwords are handled by Supabase Auth.
-- ------------------------------------------------------------

create table public.students (
  id uuid primary key default gen_random_uuid(),

  auth_user_id uuid unique references auth.users(id) on delete set null,

  roll_number text not null unique,
  name text not null,
  college_email text not null unique,
  department text not null,
  year text not null,
  section text,

  profile_photo_url text,
  bio text,
  interests text[],
  skills text[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- ------------------------------------------------------------
-- CLUBS
-- One permanent record per club.
-- Clubs are archived instead of deleted.
-- ------------------------------------------------------------

create table public.clubs (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,

  category text not null,
  short_description text not null,
  description text,

  logo_url text,

  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'ARCHIVED')),

  whatsapp_group_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- ------------------------------------------------------------
-- CLUB MEMBERS
-- Connects students to clubs and stores their club-specific role.
-- ------------------------------------------------------------

create table public.club_members (
  id uuid primary key default gen_random_uuid(),

  club_id uuid not null references public.clubs(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,

  role text not null default 'MEMBER'
    check (role in ('MEMBER', 'COORDINATOR', 'HEAD')),

  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'INACTIVE')),

  joined_at timestamptz not null default now(),
  left_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint unique_club_student
    unique (club_id, student_id)
);
-- ------------------------------------------------------------
-- CLUB APPLICATIONS
-- Stores requests from students who want to join a club.
-- ------------------------------------------------------------

create table public.club_applications (
  id uuid primary key default gen_random_uuid(),

  club_id uuid not null references public.clubs(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,

  message text,

  status text not null default 'PENDING'
    check (status in ('PENDING', 'APPROVED', 'REJECTED')),

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.students(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- A student can have only one pending application
-- for a particular club at a time.
create unique index unique_pending_club_application
on public.club_applications (club_id, student_id)
where status = 'PENDING';
-- ------------------------------------------------------------
-- CLUB REQUESTS
-- Student proposals for creating a new club.
-- Admin reviews and approves/rejects the request.
-- ------------------------------------------------------------

create table public.club_requests (
  id uuid primary key default gen_random_uuid(),

  requested_by uuid not null references public.students(id) on delete restrict,

  club_name text not null,
  description text not null,
  reason text,
  proposed_head uuid references public.students(id) on delete set null,

  status text not null default 'PENDING'
    check (status in ('PENDING', 'APPROVED', 'REJECTED')),

  reviewed_by uuid references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);
-- ------------------------------------------------------------
-- ADMIN ROLES
-- Platform-level administrator status.
-- Admins remain normal student accounts.
-- ------------------------------------------------------------

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.students(id) on delete restrict,

  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACTIVE', 'REVOKED')),

  granted_by uuid references public.students(id) on delete set null,

  granted_at timestamptz,
  accepted_at timestamptz,

  revoked_by uuid references public.students(id) on delete set null,
  revoked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- A student can have only one admin-role record.
create unique index unique_admin_student
on public.admin_roles (student_id);
-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- Updates published by club management.
-- ------------------------------------------------------------

create table public.announcements (
  id uuid primary key default gen_random_uuid(),

  club_id uuid not null references public.clubs(id) on delete restrict,
  created_by uuid not null references public.students(id) on delete restrict,

  title text not null,
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index announcements_club_created_at_idx
on public.announcements (club_id, created_at desc);
-- ------------------------------------------------------------
-- NOTIFICATIONS
-- In-app notifications for students.
-- ------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.students(id) on delete cascade,

  type text not null,
  title text not null,
  message text not null,

  read boolean not null default false,

  created_at timestamptz not null default now()
);
create index notifications_student_created_at_idx
on public.notifications (student_id, created_at desc);
create index notifications_unread_idx
on public.notifications (student_id, read)
where read = false;
-- ------------------------------------------------------------
-- VERIFICATION CODES
-- Hashed one-time codes for account verification workflows.
-- Never store the plaintext OTP.
-- ------------------------------------------------------------

create table public.verification_codes (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.students(id) on delete cascade,

  purpose text not null
    check (purpose in (
      'ACCOUNT_ACTIVATION',
      'PASSWORD_RESET',
      'ADMIN_INVITATION'
    )),

  code_hash text not null,

  expires_at timestamptz not null,
  attempts integer not null default 0,
  used_at timestamptz,

  created_at timestamptz not null default now()
);
create index verification_codes_student_purpose_idx
on public.verification_codes (student_id, purpose, created_at desc);
-- ------------------------------------------------------------
-- AUDIT LOGS
-- Records important administrative and system actions.
-- ------------------------------------------------------------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  actor_student_id uuid references public.students(id) on delete set null,

  action text not null,
  entity_type text not null,
  entity_id uuid,

  metadata jsonb,

  created_at timestamptz not null default now()
);
create index audit_logs_created_at_idx
on public.audit_logs (created_at desc);
create index audit_logs_actor_idx
on public.audit_logs (actor_student_id, created_at desc);
-- ------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- Automatically updates updated_at whenever a row changes.
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();
create trigger set_clubs_updated_at
before update on public.clubs
for each row
execute function public.set_updated_at();
create trigger set_club_members_updated_at
before update on public.club_members
for each row
execute function public.set_updated_at();
create trigger set_club_applications_updated_at
before update on public.club_applications
for each row
execute function public.set_updated_at();
create trigger set_club_requests_updated_at
before update on public.club_requests
for each row
execute function public.set_updated_at();
create trigger set_admin_roles_updated_at
before update on public.admin_roles
for each row
execute function public.set_updated_at();
create trigger set_announcements_updated_at
before update on public.announcements
for each row
execute function public.set_updated_at();
-- ============================================================
-- ROW LEVEL SECURITY
-- Enable RLS on all application tables.
-- Detailed access policies will be added next.
-- ============================================================

alter table public.students enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.club_applications enable row level security;
alter table public.club_requests enable row level security;
alter table public.admin_roles enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.verification_codes enable row level security;
alter table public.audit_logs enable row level security;
-- ============================================================
-- AUTHORIZATION HELPERS
-- Reusable functions for RLS policies.
-- ============================================================

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.students
  where auth_user_id = auth.uid()
  limit 1;
$$;
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles
    where student_id = public.current_student_id()
      and status = 'ACTIVE'
  );
$$;
create or replace function public.is_club_member(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_members
    where club_id = target_club_id
      and student_id = public.current_student_id()
      and status = 'ACTIVE'
  );
$$;
create or replace function public.is_club_manager(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_members
    where club_id = target_club_id
      and student_id = public.current_student_id()
      and role in ('HEAD', 'COORDINATOR')
      and status = 'ACTIVE'
  )
  or public.is_admin();
$$;
create or replace function public.is_club_head(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_members
    where club_id = target_club_id
      and student_id = public.current_student_id()
      and role = 'HEAD'
      and status = 'ACTIVE'
  )
  or public.is_admin();
$$;
-- ============================================================
-- RLS POLICIES — BASE ACCESS
-- ============================================================

-- ------------------------------------------------------------
-- CLUBS
-- Public visitors can view active clubs.
-- ------------------------------------------------------------

create policy "Anyone can view active clubs"
on public.clubs
for select
using (status = 'ACTIVE');
-- ------------------------------------------------------------
-- STUDENTS
-- A logged-in student can view their own student record.
-- ------------------------------------------------------------

create policy "Students can view their own profile"
on public.students
for select
to authenticated
using (auth_user_id = auth.uid());
-- ------------------------------------------------------------
-- CLUB MEMBERS
-- Students can view memberships for clubs they belong to.
-- Club managers and admins can also view memberships.
-- ------------------------------------------------------------

create policy "Members can view club membership"
on public.club_members
for select
to authenticated
using (
  public.is_club_member(club_id)
  or public.is_club_manager(club_id)
);
-- ------------------------------------------------------------
-- CLUB APPLICATIONS
-- Students can view their own applications.
-- ------------------------------------------------------------

create policy "Students can view their own applications"
on public.club_applications
for select
to authenticated
using (
  student_id = public.current_student_id()
);
-- Students can submit an application for themselves.
create policy "Students can submit club applications"
on public.club_applications
for insert
to authenticated
with check (
  student_id = public.current_student_id()
);
-- Club managers can view applications for their club.
create policy "Club managers can view applications"
on public.club_applications
for select
to authenticated
using (
  public.is_club_manager(club_id)
);
-- ------------------------------------------------------------
-- CLUB REQUESTS
-- Students can view their own requests.
-- ------------------------------------------------------------

create policy "Students can view their own club requests"
on public.club_requests
for select
to authenticated
using (
  requested_by = public.current_student_id()
);
-- Students can submit requests for themselves.
create policy "Students can submit club requests"
on public.club_requests
for insert
to authenticated
with check (
  requested_by = public.current_student_id()
);
-- Admins can view all club requests.
create policy "Admins can view club requests"
on public.club_requests
for select
to authenticated
using (
  public.is_admin()
);
-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- Everyone can view announcements from active clubs.
-- ------------------------------------------------------------

create policy "Anyone can view announcements"
on public.announcements
for select
using (
  exists (
    select 1
    from public.clubs
    where clubs.id = announcements.club_id
      and clubs.status = 'ACTIVE'
  )
);
-- ------------------------------------------------------------
-- NOTIFICATIONS
-- Students can only view their own notifications.
-- ------------------------------------------------------------

create policy "Students can view their own notifications"
on public.notifications
for select
to authenticated
using (
  student_id = public.current_student_id()
);
-- Students can mark their own notifications as read.
create policy "Students can update their own notifications"
on public.notifications
for update
to authenticated
using (
  student_id = public.current_student_id()
)
with check (
  student_id = public.current_student_id()
);
-- ------------------------------------------------------------
-- ADMIN ROLES
-- Students can see their own admin role.
-- ------------------------------------------------------------

create policy "Students can view their own admin role"
on public.admin_roles
for select
to authenticated
using (
  student_id = public.current_student_id()
);
-- ------------------------------------------------------------
-- VERIFICATION CODES
-- No client-side access.
-- OTP operations will be handled server-side.
-- ------------------------------------------------------------

-- Intentionally no SELECT/INSERT/UPDATE policies.


-- ------------------------------------------------------------
-- AUDIT LOGS
-- No client-side access.
-- Audit records are written server-side.
-- ------------------------------------------------------------

-- Intentionally no SELECT/INSERT/UPDATE policies.


-- ============================================================
-- BUSINESS-RULE CONSTRAINTS
-- ============================================================

-- A club can have only one active Head.
create unique index unique_active_club_head
on public.club_members (club_id)
where role = 'HEAD'
  and status = 'ACTIVE';
create unique index unique_active_admin
on public.admin_roles (student_id)
where status = 'ACTIVE';
-- Basic data consistency checks

alter table public.club_members
add constraint club_members_left_at_consistency
check (
  (status = 'ACTIVE' and left_at is null)
  or
  (status = 'INACTIVE' and left_at is not null)
);
alter table public.club_applications
add constraint club_applications_review_consistency
check (
  (status = 'PENDING' and reviewed_at is null and reviewed_by is null)
  or
  (status in ('APPROVED', 'REJECTED') and reviewed_at is not null and reviewed_by is not null)
);
alter table public.verification_codes
add constraint verification_codes_attempts_valid
check (attempts >= 0);
alter table public.verification_codes
add constraint verification_codes_expiry_after_creation
check (expires_at > created_at);
create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'ACTIVE'
     and new.status = 'REVOKED'
     and not exists (
       select 1
       from public.admin_roles
       where status = 'ACTIVE'
         and id <> old.id
     )
  then
    raise exception 'The last active admin cannot be removed';
  end if;

  return new;
end;
$$;
create trigger prevent_last_admin_removal
before update on public.admin_roles
for each row
execute function public.prevent_last_admin_removal();
alter table public.verification_codes
add constraint verification_codes_attempts_limit
check (attempts <= 5);
