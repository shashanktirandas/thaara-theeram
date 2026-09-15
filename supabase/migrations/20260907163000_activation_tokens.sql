create table public.activation_tokens (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),

  constraint activation_tokens_expiry_after_creation
    check (expires_at > created_at)
);
create index activation_tokens_student_created_at_idx
on public.activation_tokens (student_id, created_at desc);
create unique index unique_active_activation_token
on public.activation_tokens (student_id)
where used_at is null;
alter table public.activation_tokens enable row level security;
