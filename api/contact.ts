import type { VercelRequest, VercelResponse } from '@vercel/node'

type ContactPayload = {
  name?: string
  email?: string
  company?: string
  service?: string
  message?: string
  locale?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ContactPayload
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const message = String(body.message || '').trim()
  const company = String(body.company || '').trim()
  const service = String(body.service || '').trim()
  const locale = body.locale === 'nl' ? 'nl' : 'en'

  if (!name || !email || !service || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const to = process.env.CONTACT_TO_EMAIL || 'botbuildr.ai@outlook.com'
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL || 'BotBuildr <hello@botbuildr.ai>'

  const subject =
    locale === 'nl'
      ? `[BotBuildr] Nieuw bericht van ${name}`
      : `[BotBuildr] New message from ${name}`

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    `Service: ${service}`,
    `Locale: ${locale}`,
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n')

  if (!resendKey) {
    console.log('[contact] RESEND_API_KEY not set — payload logged only:', { name, email, company, service, locale })
    return res.status(200).json({ ok: true, mode: 'log_only' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('[contact] Resend error:', detail)
      return res.status(502).json({ error: 'Email delivery failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
