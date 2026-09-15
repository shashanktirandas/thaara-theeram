type SendBrevoEmailParams = {
  to: {
    email: string
    name?: string
  }
  subject: string
  htmlContent: string
  textContent?: string
  tag?: string
}

export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
  tag,
}: SendBrevoEmailParams) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || 'Thaara Theeram'

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo environment variables are not configured.')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [to],
      subject,
      htmlContent,
      ...(textContent ? { textContent } : {}),
      ...(tag ? { tags: [tag] } : {}),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Brevo email failed: ${response.status} ${errorText}`)
  }

  return response.json()
}