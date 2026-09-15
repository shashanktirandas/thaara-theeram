alter table public.clubs
add column if not exists tagline text,
add column if not exists vision text,
add column if not exists mission text,
add column if not exists activities text,
add column if not exists banner_url text;