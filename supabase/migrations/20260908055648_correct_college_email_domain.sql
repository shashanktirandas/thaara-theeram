update public.students
set college_email = replace(college_email, '@pallaviengneeringcollege.ac.in', '@pallaviengineeringcollege.ac.in'),
    updated_at = now()
where college_email like '%@pallaviengneeringcollege.ac.in';;
