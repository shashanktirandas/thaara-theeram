alter table public.club_requests
add column category text;

alter table public.club_requests
add constraint club_requests_category_check
check (
  category is null
  or category in (
    'Technical',
    'Cultural',
    'Arts & Media',
    'Sports',
    'Literary',
    'Social & Service',
    'Entrepreneurship',
    'Academic',
    'Other'
  )
);