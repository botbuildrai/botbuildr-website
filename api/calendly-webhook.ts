import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Calendly webhook — updates pipeline when a 30-min call is booked.
 * Configure in Calendly: Integrations → Webhooks → https://botbuildr.ai/api/calendly-webhook
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.CALENDLY_WEBHOOK_SECRET
  const signature = req.headers['calendly-webhook-signature'] as string | undefined

  if (secret && signature) {
    // Calendly signing key verification can be added when secret is set
  }

  const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const eventType = event?.event as string | undefined
  const payload = event?.payload

  if (eventType === 'invitee.created') {
    const email = payload?.email as string | undefined
    const name = payload?.name as string | undefined
    const eventName = payload?.scheduled_event?.name as string | undefined

    const resendKey = process.env.RESEND_API_KEY
    const notifyTo = process.env.CONTACT_TO_EMAIL || 'botbuildr.ai@outlook.com'

    if (resendKey && email) {
      const from = process.env.CONTACT_FROM_EMAIL || 'BotBuildr <hello@botbuildr.ai>'
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [notifyTo],
          subject: `[BotBuildr] Calendly: ${name || email} — ${eventName || 'call booked'}`,
          text: [
            `Nieuwe boeking via Calendly`,
            `Naam: ${name || '—'}`,
            `E-mail: ${email}`,
            `Event: ${eventName || '—'}`,
            `Tijd: ${payload?.scheduled_event?.start_time || '—'}`,
            '',
            'Update leads/prospects.md → DEMO_AANGEVRAAGD of CLOSER_ACTIEF',
          ].join('\n'),
        }),
      }).catch((err) => console.error('[calendly-webhook] notify failed', err))
    }

    console.log('[calendly-webhook] invitee.created', { email, name, eventName })
  }

  return res.status(200).json({ ok: true })
}
