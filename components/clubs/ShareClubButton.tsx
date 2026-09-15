'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type ShareClubButtonProps = {
  clubName: string
  slug: string
  shortDescription: string | null
  clubLogoUrl: string | null
}

const BRAND_MARK = '/brand/thaara-mark.png'

const loadImage = (
  src: string
): Promise<HTMLImageElement> => {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image()

      image.onload = () =>
        resolve(image)

      image.onerror = () =>
        reject(
          new Error(
            `Failed to load image: ${src}`
          )
        )

      image.src = src
    }
  )
}

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2)

  context.beginPath()
  context.moveTo(x + r, y)
  context.lineTo(x + width - r, y)
  context.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r
  )
  context.lineTo(
    x + width,
    y + height - r
  )
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height
  )
  context.lineTo(x + r, y + height)
  context.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r
  )
  context.lineTo(x, y + r)
  context.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  )
  context.closePath()
}

const drawImageContain = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const imageRatio =
    image.naturalWidth / image.naturalHeight

  const boxRatio = width / height

  let drawWidth = width
  let drawHeight = height

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio
  } else {
    drawWidth = height * imageRatio
  }

  const drawX =
    x + (width - drawWidth) / 2

  const drawY =
    y + (height - drawHeight) / 2

  context.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  )
}

export default function ShareClubButton({
  clubName,
  slug,
  shortDescription,
  clubLogoUrl,
}: ShareClubButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [busyAction, setBusyAction] =
    useState<string | null>(null)

  const [clubUrl, setClubUrl] =
    useState(`/clubs/${slug}`)

  /*
   * -------------------------------------------------------
   * CLUB URL
   * -------------------------------------------------------
   */

  useEffect(() => {
    setClubUrl(
      `${window.location.origin}/clubs/${slug}`
    )
  }, [slug])

  /*
   * -------------------------------------------------------
   * ESCAPE KEY
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!open) return

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [open])

  /*
   * -------------------------------------------------------
   * PREVENT BACKGROUND SCROLL
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!open) return

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow =
        originalOverflow
    }
  }, [open])

  /*
   * -------------------------------------------------------
   * BRANDED QR
   * -------------------------------------------------------
   */

  const generateBrandedQr = async (
    size = 700
  ): Promise<string> => {
    const rawQr =
      await QRCode.toDataURL(clubUrl, {
        width: size,
        margin: 4,
        errorCorrectionLevel: 'H',
      })

    const qrImage =
      await loadImage(rawQr)

    const markImage =
      await loadImage(BRAND_MARK)

    const canvas =
      document.createElement('canvas')

    canvas.width = size
    canvas.height = size

    const context =
      canvas.getContext('2d')

    if (!context) {
      throw new Error(
        'Canvas is not supported.'
      )
    }

    /*
     * White base.
     */

    context.fillStyle = '#ffffff'

    context.fillRect(
      0,
      0,
      size,
      size
    )

    /*
     * QR.
     */

    context.drawImage(
      qrImage,
      0,
      0,
      size,
      size
    )

    /*
     * Protected center.
     */

    const centerBox =
      size * 0.205

    const centerX =
      (size - centerBox) / 2

    const centerY =
      (size - centerBox) / 2

    context.fillStyle = '#ffffff'

    drawRoundedRect(
      context,
      centerX,
      centerY,
      centerBox,
      centerBox,
      size * 0.035
    )

    context.fill()

    /*
     * Thaara Theeram dark tile.
     */

    const markTile =
      size * 0.125

    const markTileX =
      (size - markTile) / 2

    const markTileY =
      (size - markTile) / 2

    context.fillStyle = '#09090b'

    drawRoundedRect(
      context,
      markTileX,
      markTileY,
      markTile,
      markTile,
      size * 0.025
    )

    context.fill()

    /*
     * Gold star.
     */

    const markSize =
      size * 0.082

    drawImageContain(
      context,
      markImage,
      (size - markSize) / 2,
      (size - markSize) / 2,
      markSize,
      markSize
    )

    return canvas.toDataURL(
      'image/png'
    )
  }

  /*
   * -------------------------------------------------------
   * GENERATE QR WHEN OPEN
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!open || !clubUrl) return

    let cancelled = false

    const generate = async () => {
      try {
        const brandedQr =
          await generateBrandedQr(700)

        if (!cancelled) {
          setQrCode(brandedQr)
        }
      } catch (error) {
        console.error(
          'Branded QR generation failed:',
          error
        )

        if (!cancelled) {
          setQrCode('')
        }
      }
    }

    generate()

    return () => {
      cancelled = true
    }
  }, [open, clubUrl])

  /*
   * -------------------------------------------------------
   * COPY LINK
   * -------------------------------------------------------
   */

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        clubUrl
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      try {
        const textarea =
          document.createElement('textarea')

        textarea.value = clubUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'

        document.body.appendChild(
          textarea
        )

        textarea.focus()
        textarea.select()

        document.execCommand('copy')

        textarea.remove()

        setCopied(true)

        window.setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (error) {
        console.error(
          'Copy link failed:',
          error
        )
      }
    }
  }

  /*
   * -------------------------------------------------------
   * NATIVE SHARE
   * -------------------------------------------------------
   */

  const shareNative = async () => {
    if (!navigator.share) {
      await copyLink()
      return
    }

    try {
      await navigator.share({
        title: clubName,
        text:
          `Check out ${clubName} on Thaara Theeram.`,
        url: clubUrl,
      })
    } catch {
      // User cancelled.
    }
  }

  /*
   * -------------------------------------------------------
   * WHATSAPP
   * -------------------------------------------------------
   */

  const shareWhatsApp = () => {
    const message =
      `Check out ${clubName} on Thaara Theeram: ${clubUrl}`

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  /*
   * -------------------------------------------------------
   * CREATE QR FILE
   * -------------------------------------------------------
   */

  const createQrFile =
    async (): Promise<File> => {
      const brandedQr =
        qrCode ||
        (await generateBrandedQr(1000))

      const qrImage =
        await loadImage(brandedQr)

      const canvas =
        document.createElement('canvas')

      canvas.width = 1200
      canvas.height = 1200

      const context =
        canvas.getContext('2d')

      if (!context) {
        throw new Error(
          'Canvas is not supported.'
        )
      }

      /*
       * Background.
       */

      context.fillStyle = '#ffffff'

      context.fillRect(
        0,
        0,
        1200,
        1200
      )

      /*
       * QR card.
       */

      context.fillStyle = '#f8fafc'

      drawRoundedRect(
        context,
        80,
        80,
        1040,
        1040,
        48
      )

      context.fill()

      /*
       * QR.
       */

      context.drawImage(
        qrImage,
        160,
        160,
        880,
        880
      )

      /*
       * Brand.
       */

      context.textAlign = 'center'

      context.fillStyle = '#0f172a'

      context.font =
        '700 30px Arial'

      context.fillText(
        'THAARA THEERAM',
        600,
        1105
      )

      context.fillStyle = '#64748b'

      context.font =
        '400 20px Arial'

      context.fillText(
        'A home for every passion',
        600,
        1140
      )

      const blob =
        await new Promise<Blob | null>(
          resolve => {
            canvas.toBlob(
              resolve,
              'image/png'
            )
          }
        )

      if (!blob) {
        throw new Error(
          'Failed to create QR image.'
        )
      }

      return new File(
        [blob],
        `${slug}-thaara-theeram-qr.png`,
        {
          type: 'image/png',
        }
      )
    }

  /*
   * -------------------------------------------------------
   * DOWNLOAD QR
   * -------------------------------------------------------
   */

  const downloadQr = async () => {
    if (busyAction) return

    setBusyAction('download-qr')

    try {
      const file =
        await createQrFile()

      const url =
        URL.createObjectURL(file)

      const anchor =
        document.createElement('a')

      anchor.href = url
      anchor.download = file.name

      document.body.appendChild(anchor)

      anchor.click()

      anchor.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(
        'QR download failed:',
        error
      )
    } finally {
      setBusyAction(null)
    }
  }

  /*
   * -------------------------------------------------------
   * SHARE QR
   * -------------------------------------------------------
   */

  const shareQr = async () => {
    if (busyAction) return

    setBusyAction('share-qr')

    try {
      const file =
        await createQrFile()

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title:
            `${clubName} — Thaara Theeram`,
          text:
            `Discover ${clubName} on Thaara Theeram.`,
          files: [file],
        })
      } else {
        const url =
          URL.createObjectURL(file)

        const anchor =
          document.createElement('a')

        anchor.href = url
        anchor.download = file.name

        document.body.appendChild(anchor)

        anchor.click()

        anchor.remove()

        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error(
        'QR share failed:',
        error
      )
    } finally {
      setBusyAction(null)
    }
  }

  /*
   * -------------------------------------------------------
   * CREATE POSTER
   * -------------------------------------------------------
   */

  const createPosterFile =
    async (): Promise<File> => {
      const brandedQr =
        qrCode ||
        (await generateBrandedQr(900))

      const qrImage =
        await loadImage(brandedQr)

      let clubLogo:
        | HTMLImageElement
        | null = null

      try {
  const proxyLogoUrl =
    `/api/clubs/${encodeURIComponent(slug)}/identity/image?type=logo`

  clubLogo = await loadImage(proxyLogoUrl)
} catch (error) {
  console.error(
    'Could not load club logo for poster:',
    error
  )

  clubLogo = null
}

      const canvas =
        document.createElement('canvas')

      canvas.width = 1080
      canvas.height = 1527

      const context =
        canvas.getContext('2d')

      if (!context) {
        throw new Error(
          'Canvas is not supported.'
        )
      }

      /*
       * Background.
       */

      const gradient =
        context.createLinearGradient(
          0,
          0,
          0,
          1527
        )

      gradient.addColorStop(
        0,
        '#020617'
      )

      gradient.addColorStop(
        0.48,
        '#0f172a'
      )

      gradient.addColorStop(
        0.49,
        '#f8fafc'
      )

      gradient.addColorStop(
        1,
        '#ffffff'
      )

      context.fillStyle = gradient

      context.fillRect(
        0,
        0,
        1080,
        1527
      )

      /*
       * Mini mark.
       */

      try {
        const mark =
          await loadImage(
            BRAND_MARK
          )

        drawImageContain(
          context,
          mark,
          480,
          55,
          120,
          120
        )
      } catch {
        // Continue without mark.
      }

      /*
       * Brand name.
       */

      context.textAlign = 'center'

      context.fillStyle = '#ffffff'

      context.font =
        '700 34px Arial'

      context.fillText(
        'THAARA THEERAM',
        540,
        225
      )

      context.fillStyle = '#cbd5e1'

      context.font =
        '400 20px Arial'

      context.fillText(
        'A HOME FOR EVERY PASSION',
        540,
        260
      )

      /*
       * Club logo.
       */

      if (clubLogo) {
        context.fillStyle = '#ffffff'

        drawRoundedRect(
          context,
          440,
          305,
          200,
          200,
          42
        )

        context.fill()

        context.save()

        drawRoundedRect(
          context,
          460,
          325,
          160,
          160,
          30
        )

        context.clip()

        drawImageContain(
          context,
          clubLogo,
          460,
          325,
          160,
          160
        )

        context.restore()
      }

      /*
       * Club name.
       */

      context.fillStyle = '#ffffff'

      context.font =
        '700 58px Arial'

      context.fillText(
        clubName.toUpperCase(),
        540,
        clubLogo ? 575 : 380
      )

      /*
       * Description.
       */

      const description =
        shortDescription
          ? shortDescription.length > 90
            ? `${shortDescription.slice(
                0,
                87
              )}...`
            : shortDescription
          : `Discover ${clubName} on Thaara Theeram.`

      context.fillStyle = '#cbd5e1'

      context.font =
        '400 22px Arial'

      context.fillText(
        description,
        540,
        clubLogo ? 620 : 425
      )

      /*
       * QR card.
       */

      const qrCardY =
        clubLogo ? 690 : 500

      context.fillStyle = '#ffffff'

      drawRoundedRect(
        context,
        130,
        qrCardY,
        820,
        620,
        48
      )

      context.fill()

      context.drawImage(
        qrImage,
        235,
        qrCardY + 35,
        610,
        610
      )

      /*
       * Scan text.
       */

      const scanY =
        qrCardY + 670

      context.fillStyle = '#0f172a'

      context.font =
        '700 34px Arial'

      context.fillText(
        'SCAN TO DISCOVER',
        540,
        scanY
      )

      context.fillStyle = '#64748b'

      context.font =
        '400 20px Arial'

      context.fillText(
        clubName,
        540,
        scanY + 36
      )

      context.fillStyle = '#2563eb'

      context.font =
        '600 18px Arial'

      context.fillText(
        clubUrl,
        540,
        scanY + 75
      )

      /*
       * Footer.
       */

      context.fillStyle = '#94a3b8'

      context.font =
        '400 18px Arial'

      context.fillText(
        'clubs • people • possibilities',
        540,
        1470
      )

      const blob =
        await new Promise<Blob | null>(
          resolve => {
            canvas.toBlob(
              resolve,
              'image/png'
            )
          }
        )

      if (!blob) {
        throw new Error(
          'Failed to create poster.'
        )
      }

      return new File(
        [blob],
        `${slug}-thaara-theeram-poster.png`,
        {
          type: 'image/png',
        }
      )
    }

  /*
   * -------------------------------------------------------
   * DOWNLOAD POSTER
   * -------------------------------------------------------
   */

  const downloadPoster =
    async () => {
      if (busyAction) return

      setBusyAction(
        'download-poster'
      )

      try {
        const file =
          await createPosterFile()

        const url =
          URL.createObjectURL(file)

        const anchor =
          document.createElement('a')

        anchor.href = url
        anchor.download = file.name

        document.body.appendChild(anchor)

        anchor.click()

        anchor.remove()

        URL.revokeObjectURL(url)
      } catch (error) {
        console.error(
          'Poster generation failed:',
          error
        )
      } finally {
        setBusyAction(null)
      }
    }

  /*
   * -------------------------------------------------------
   * UI
   * -------------------------------------------------------
   */

  return (
    <>
      {/* Main button */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border border-white/20
          bg-white/5
          px-7 py-3.5
          font-semibold
          text-white
          backdrop-blur
          transition
          hover:bg-white/10
          focus:outline-none
          focus:ring-2
          focus:ring-white/40
        "
      >
        <span className="text-yellow-400">
          ↗
        </span>

        Share Club
      </button>

      {open && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-slate-950/75
            px-4 py-5
            backdrop-blur-sm
          "
          onMouseDown={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-club-title"
            className="
              w-full
              max-w-lg
              max-h-[calc(100vh-40px)]
              overflow-y-auto
              rounded-[2rem]
              bg-white
              shadow-2xl
              overscroll-contain

              [scrollbar-width:none]
              [-ms-overflow-style:none]

              [&::-webkit-scrollbar]:hidden
            "
          >
            <div className="p-6 sm:p-8">

              {/* -----------------------------------------
                  HEADER
              ----------------------------------------- */}

              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex h-7 w-7
                        items-center justify-center
                        rounded-full
                        bg-slate-950
                      "
                    >
                      <span className="text-sm font-bold text-yellow-400">
                        ★
                      </span>
                    </div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-blue-600
                      "
                    >
                      Thaara Theeram
                    </p>
                  </div>

                  <h2
                    id="share-club-title"
                    className="
                      mt-3
                      text-2xl
                      font-bold
                      tracking-tight
                      text-slate-950
                    "
                  >
                    Share {clubName}
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-sm
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Help others discover this
                    club on Thaara Theeram.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close share dialog"
                  className="
                    flex h-9 w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    text-lg
                    text-slate-500
                    transition
                    hover:bg-slate-200
                    hover:text-slate-900
                  "
                >
                  ×
                </button>
              </div>

              {/* -----------------------------------------
                  CLUB LINK
              ----------------------------------------- */}

              <div className="mt-7">
                <p
                  className="
                    mb-2
                    text-xs
                    font-semibold
                    uppercase
                    tracking-widest
                    text-slate-400
                  "
                >
                  Club link
                </p>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-2
                  "
                >
                  <p
                    className="
                      min-w-0
                      flex-1
                      truncate
                      px-2
                      text-sm
                      text-slate-600
                    "
                  >
                    {clubUrl}
                  </p>

                  <button
                    type="button"
                    onClick={copyLink}
                    className="
                      shrink-0
                      rounded-xl
                      bg-blue-700
                      px-4 py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-800
                    "
                  >
                    {copied
                      ? 'Copied'
                      : 'Copy'}
                  </button>
                </div>
              </div>

              {/* -----------------------------------------
                  DIRECT SHARE
              ----------------------------------------- */}

              <div className="mt-7">
                <p
                  className="
                    mb-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-widest
                    text-slate-400
                  "
                >
                  Share directly
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-slate-200
                      px-4 py-3
                      text-sm
                      font-semibold
                      text-slate-800
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                    "
                  >
                    <span className="text-base">
                      ◉
                    </span>

                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={shareNative}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-slate-200
                      px-4 py-3
                      text-sm
                      font-semibold
                      text-slate-800
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                    "
                  >
                    <span className="text-base">
                      ↗
                    </span>

                    More options
                  </button>
                </div>
              </div>

              {/* -----------------------------------------
                  QR SECTION
              ----------------------------------------- */}

              <div
                className="
                  mt-8
                  border-t
                  border-slate-200
                  pt-7
                "
              >
                <div className="text-center">

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-blue-50
                      px-3 py-1.5
                    "
                  >
                    <span className="text-yellow-500">
                      ★
                    </span>

                    <span
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-widest
                        text-blue-700
                      "
                    >
                      Share with QR
                    </span>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      text-slate-500
                    "
                  >
                    Let students scan and
                    discover {clubName}.
                  </p>

                  {/* QR */}

                  <div
                    className="
                      mx-auto
                      mt-5
                      w-fit
                      rounded-[2rem]
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex
                        h-56 w-56
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white
                      "
                    >
                      {qrCode ? (
                        <img
                          src={qrCode}
                          alt={`QR code for ${clubName}`}
                          className="
                            h-full
                            w-full
                          "
                        />
                      ) : (
                        <div className="text-center">
                          <div
                            className="
                              mx-auto
                              mb-3
                              h-8 w-8
                              animate-spin
                              rounded-full
                              border-2
                              border-slate-200
                              border-t-blue-600
                            "
                          />

                          <p
                            className="
                              text-sm
                              text-slate-400
                            "
                          >
                            Preparing QR...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    className="
                      mt-4
                      text-xs
                      text-slate-400
                    "
                  >
                    Scan to discover {clubName}
                  </p>

                  {/* -------------------------------------
                      QR ACTIONS
                  ------------------------------------- */}

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <button
                      type="button"
                      onClick={shareQr}
                      disabled={!!busyAction}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        px-4 py-3
                        text-sm
                        font-semibold
                        text-slate-800
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span className="text-base">
                        ↗
                      </span>

                      {busyAction ===
                      'share-qr'
                        ? 'Preparing...'
                        : 'Share QR'}
                    </button>

                    <button
                      type="button"
                      onClick={downloadQr}
                      disabled={!!busyAction}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        px-4 py-3
                        text-sm
                        font-semibold
                        text-slate-800
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span className="text-base">
                        ↓
                      </span>

                      {busyAction ===
                      'download-qr'
                        ? 'Preparing...'
                        : 'Download QR'}
                    </button>
                  </div>

                  {/* Poster */}

                  <button
                    type="button"
                    onClick={
                      downloadPoster
                    }
                    disabled={!!busyAction}
                    className="
                      mt-3
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-slate-950
                      px-5 py-3.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-slate-800
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <span className="text-yellow-400">
                      ★
                    </span>

                    {busyAction ===
                    'download-poster'
                      ? 'Preparing poster...'
                      : 'Download Branded Poster'}
                  </button>

                </div>
              </div>

              {/* -----------------------------------------
                  DONE
              ----------------------------------------- */}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  mt-6
                  w-full
                  rounded-2xl
                  bg-slate-100
                  px-5 py-3.5
                  text-sm
                  font-semibold
                  text-slate-900
                  transition
                  hover:bg-slate-200
                "
              >
                Done
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  )
}