import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { slug } = await params

    const type =
      request.nextUrl.searchParams.get('type')

    if (type !== 'logo' && type !== 'banner') {
      return NextResponse.json(
        {
          error: 'Invalid image type.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: club, error } = await supabase
      .from('clubs')
      .select('logo_url, banner_url')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single()

    if (error || !club) {
      console.error(
        'Club image proxy: club not found',
        {
          slug,
          error,
        }
      )

      return NextResponse.json(
        {
          error: 'Club not found.',
        },
        { status: 404 }
      )
    }

    const imageUrl =
      type === 'logo'
        ? club.logo_url
        : club.banner_url

    if (!imageUrl) {
      return NextResponse.json(
        {
          error: `No ${type} image configured for this club.`,
        },
        { status: 404 }
      )
    }

    const imageResponse = await fetch(imageUrl, {
      cache: 'no-store',
    })

    if (!imageResponse.ok) {
      console.error(
        'Club image proxy: storage fetch failed',
        {
          slug,
          type,
          status: imageResponse.status,
        }
      )

      return NextResponse.json(
        {
          error: 'Could not retrieve club image.',
        },
        { status: 502 }
      )
    }

    const contentType =
      imageResponse.headers.get('content-type') ||
      'image/png'

    const imageBuffer =
      await imageResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error(
      'Club identity image proxy error:',
      error
    )

    return NextResponse.json(
      {
        error: 'Something went wrong.',
      },
      { status: 500 }
    )
  }
}