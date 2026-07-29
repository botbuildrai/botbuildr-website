import type { VercelRequest, VercelResponse } from '@vercel/node'

const PREVIEW_EMAIL = 'mike.tromp96@gmail.com'
const CTA =
  'Reageer op deze mail met wat je graag geautomatiseerd zou willen zien — ik stuur je een op maat gemaakt plan. Pitch deck in de bijlage.'

const MAILS = [
  { n: 1, company: 'Skins Unlimited', name: 'Igor', intended: 'info@skinsunlimited.nl' },
  { n: 2, company: 'The Longevity Store', name: 'Tom', intended: 'tom@thelongevitystore.com' },
  { n: 3, company: 'Sorelle', name: 'Marrit', intended: 'info@sorellesupplements.com' },
  { n: 4, company: 'Enzodoor', name: 'Rosan', intended: 'info@enzodoor.nl' },
  { n: 5, company: 'Opmaat', name: '', intended: 'info@opmaatrecruitment.nl' },
]

function body(m: (typeof MAILS)[0]) {
  const hey = m.name ? `Hey ${m.name},` : 'Hey,'
  return `${hey}\n\nHoe zou ${m.company} eruitzien als klantenservice geautomatiseerd is?\n\nWij zijn koning in klantenservice automatiseren. Wil jij dat ook?\n\n${CTA}\n\nMike\nBotBuildr — https://botbuildr.ai`
}

async function fetchPitchDeckBase64(): Promise<{ content: string; filename: string } | null> {
  const url = process.env.PITCH_DECK_URL || 'https://botbuildr.ai/pitch-deck.pdf'
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return {
      content: buf.toString('base64'),
      filename: process.env.PITCH_DECK_FILENAME || 'BotBuildr-Pitch-Deck.pdf',
    }
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const enabled = process.env.ENABLE_OUTREACH_PREVIEW === 'true'
  const secret = process.env.OUTREACH_API_SECRET
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!enabled && (!secret || auth !== secret)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return res.status(503).json({ error: 'RESEND_API_KEY not configured' })
  }

  const from =
    process.env.OUTREACH_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    'Mike van BotBuildr <hello@botbuildr.ai>'
  const replyTo =
    process.env.OUTREACH_REPLY_TO ||
    process.env.CONTACT_TO_EMAIL ||
    'botbuildr.ai@outlook.com'
  const footer =
    '\n\n---\nWil je geen mails meer ontvangen? Antwoord met STOP — dan benaderen we je niet meer.'
  const deck = await fetchPitchDeckBase64()
  const results: { n: number; company: string; ok: boolean; id?: string; error?: string }[] = []

  for (const m of MAILS) {
    const payload: Record<string, unknown> = {
      from,
      to: [PREVIEW_EMAIL],
      reply_to: replyTo,
      subject: `[TEST Resend ${m.n}/5] ${m.company} — klantenservice automatiseren?`,
      text: `PREVIEW — beoogde ontvanger: ${m.intended}\n\n---\n\n${body(m)}${footer}`,
      headers: { 'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>` },
    }
    if (deck) {
      payload.attachments = [{ filename: deck.filename, content: deck.content }]
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { id?: string; message?: string }
      results.push({
        n: m.n,
        company: m.company,
        ok: response.ok,
        id: data.id,
        error: response.ok ? undefined : data.message,
      })
    } catch (err) {
      results.push({
        n: m.n,
        company: m.company,
        ok: false,
        error: err instanceof Error ? err.message : 'send failed',
      })
    }
    await new Promise((r) => setTimeout(r, 600))
  }

  return res.status(200).json({
    ok: results.every((r) => r.ok),
    to: PREVIEW_EMAIL,
    from,
    attachedPitchDeck: Boolean(deck),
    results,
  })
}
