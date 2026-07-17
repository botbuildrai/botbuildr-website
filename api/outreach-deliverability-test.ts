import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  buildOutreachMail,
  SUBJECT_VARIANTS,
  UNSUBSCRIBE_FOOTER_TEXT,
  type SubjectVariantId,
} from './lib/outreach-template.js'

type TestLead = {
  n: number
  company: string
  name: string
  intended: string
  subjectVariant: SubjectVariantId
}

const mails: TestLead[] = [
  { n: 1, company: 'Skins Unlimited', name: 'Igor', intended: 'info@skinsunlimited.nl', subjectVariant: 'A' },
  { n: 2, company: 'The Longevity Store', name: 'Tom', intended: 'tom@thelongevitystore.com', subjectVariant: 'B' },
  { n: 3, company: 'Sorelle Supplements', name: 'Marrit', intended: 'info@sorellesupplements.com', subjectVariant: 'A' },
  { n: 4, company: 'Enzodoor', name: 'Rosan', intended: 'info@enzodoor.nl', subjectVariant: 'B' },
  { n: 5, company: 'Opmaat Recruitment', name: '', intended: 'info@opmaatrecruitment.nl', subjectVariant: 'A' },
]

const previewTo = 'mike.tromp96@gmail.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.OUTREACH_API_SECRET
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!secret || auth !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return res.status(503).json({ error: 'RESEND_API_KEY not configured' })
  }

  const from = process.env.OUTREACH_FROM_EMAIL || 'Mike van BotBuildr <hello@botbuildr.ai>'
  const replyTo = process.env.OUTREACH_REPLY_TO || 'botbuildr.ai@outlook.com'

  const results: Record<string, unknown>[] = []

  for (const m of mails) {
    const mail = buildOutreachMail({
      name: m.name,
      company: m.company,
      subjectVariant: m.subjectVariant,
    })

    const payload: Record<string, unknown> = {
      from,
      to: [previewTo],
      reply_to: replyTo,
      subject: `[v2-test ${m.n}/5 · subject ${mail.subjectVariant}] ${mail.subject}`,
      text: `TEST — beoogde ontvanger: ${m.intended}\n\n---\n\n${mail.text}${UNSUBSCRIBE_FOOTER_TEXT}`,
      html: mail.html.replace(
        '</body>',
        `<p style="margin: 1.5em 0 0; font-size: 13px; color: #666;">Wil je geen mails meer ontvangen? Antwoord met STOP.</p></body>`,
      ),
      headers: { 'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>` },
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string }
    results.push({
      n: m.n,
      company: m.company,
      subjectVariant: mail.subjectVariant,
      subject: mail.subject,
      attach: false,
      ok: response.ok,
      id: data.id || null,
      error: response.ok ? null : data.message || 'send failed',
    })

    await new Promise((r) => setTimeout(r, 1200))
  }

  return res.status(200).json({
    ok: true,
    previewTo,
    template: 'v2-deliverability-safe',
    subjectVariants: Array.from(
      new Set(Object.values(SUBJECT_VARIANTS).flat().map((v) => v.id)),
    ),
    results,
  })
}
