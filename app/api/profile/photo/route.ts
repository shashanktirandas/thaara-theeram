import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Please select an image.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Only PNG, JPEG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image must be smaller than 5 MB.' },
        { status: 400 }
      )
    }

    const extension =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'jpg'

    const path = `profiles/${student.id}/profile.${extension}`

    const admin = createAdminClient()

    const { error: uploadError } = await admin.storage
      .from('student-assets')
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Profile photo upload error:', uploadError)

      return NextResponse.json(
        { error: 'Unable to upload profile photo.' },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = admin.storage
      .from('student-assets')
      .getPublicUrl(path)

    const profilePhotoUrl = `${publicUrl}?v=${Date.now()}`

    const { error: updateError } = await admin
      .from('students')
      .update({
        profile_photo_url: profilePhotoUrl,
      })
      .eq('id', student.id)
      .eq('auth_user_id', user.id)

    if (updateError) {
      console.error('Profile photo database update error:', updateError)

      return NextResponse.json(
        { error: 'Photo uploaded but profile could not be updated.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile_photo_url: profilePhotoUrl,
    })
  } catch (error) {
    console.error('Profile photo error:', error)

    return NextResponse.json(
      { error: 'Invalid upload request.' },
      { status: 400 }
    )
  }
}