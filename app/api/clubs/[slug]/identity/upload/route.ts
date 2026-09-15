import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RouteContext = {
  params: Promise<{ slug: string }>
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
]

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
const adminSupabase = createAdminClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Please log in first.' },
        { status: 401 }
      )
    }
    

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json(
        { error: 'Student account not found.' },
        { status: 403 }
      )
    }

    const { data: club } = await supabase
      .from('clubs')
      .select('id, slug')
      .eq('slug', slug)
      .single()

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      )
    }

    const { data: membership } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', club.id)
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()

    const isHead = membership?.role === 'HEAD'
    const isAdmin = !!adminRole

    if (!isHead && !isAdmin) {
      return NextResponse.json(
        {
          error:
            'Only the club Head or Platform Admin can upload club assets.',
        },
        { status: 403 }
      )
    }

    const formData = await request.formData()

    const file = formData.get('file')
    const assetType = formData.get('type')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file was provided.' },
        { status: 400 }
      )
    }

    if (
      assetType !== 'logo' &&
      assetType !== 'banner'
    ) {
      return NextResponse.json(
        { error: 'Invalid asset type.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid image format. Use PNG, JPEG, or WebP.',
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Image must be 5 MB or smaller.',
        },
        { status: 400 }
      )
    }

    const extension =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'jpg'

    const filePath =
      `${club.slug}/${assetType}.${extension}`
    const { error: uploadError } =
      await adminSupabase.storage
        .from('club-assets')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
          cacheControl: '3600',
        })

    if (uploadError) {
      console.error(
        'Club asset upload error:',
        uploadError
      )

      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      )
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage
      .from('club-assets')
      .getPublicUrl(filePath)

    const cacheBustedUrl = `${publicUrl}?v=${Date.now()}`

    const column =
      assetType === 'logo'
        ? 'logo_url'
        : 'banner_url'

    const { error: updateError } =
      await supabase
        .from('clubs')
        .update({
          [column]: cacheBustedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', club.id)

    if (updateError) {
      console.error(
        'Club asset URL update error:',
        updateError
      )

      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    await supabase.from('audit_logs').insert({
      actor_student_id: student.id,
      action:
        assetType === 'logo'
          ? 'CLUB_LOGO_UPDATED'
          : 'CLUB_BANNER_UPDATED',
      entity_type: 'CLUB',
      entity_id: club.id,
      metadata: {
        club_slug: club.slug,
        asset_type: assetType,
        file_path: filePath,
      },
    })

    return NextResponse.json({
      success: true,
      assetType,
      url: cacheBustedUrl,
    })
  } catch (error) {
    console.error(
      'Club asset upload API error:',
      error
    )

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
