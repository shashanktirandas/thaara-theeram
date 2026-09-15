import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, roll_number, name, department, year, section, profile_photo_url')
    .eq('auth_user_id', user.id)
    .single()

  if (studentError || !student) {
    redirect('/dashboard')
  }

  const { data: adminRole, error: adminError } = await supabase
    .from('admin_roles')
    .select('id')
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  if (adminError || !adminRole) {
    redirect('/dashboard')
  }

  return {
    supabase,
    user,
    student,
  }
}