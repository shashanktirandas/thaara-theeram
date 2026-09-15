insert into public.club_members (
  club_id,
  student_id,
  role,
  status
)
select
  c.id,
  s.id,
  'HEAD',
  'ACTIVE'
from public.clubs c
cross join public.students s
where c.slug = 'ifocus'
  and s.roll_number = '256f5a0512';
