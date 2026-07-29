/**
 * Send Resend preview emails (run on Vercel with injected env):
 * npx vercel env run --environment production -- node scripts/send-resend-preview.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const previewTo = 'mike.tromp96@gmail.com'
const cta =
  'Reageer op deze mail met wat je graag geautomatiseerd zou willen zien — ik stuur je een op maat gemaakt plan. Pitch deck in de bijlage.'

const mails = [
  { n: 1, company: 'Skins Unlimited', name: 'Igor', intended: 'info@skinsunlimited.nl' },
  { n: 2, company: 'The Longevity Store', name: 'Tom', intended: 'tom@thelongevitystore.com' },
  { n: 3, company: 'Sorelle', name: 'Marrit', intended: 'info@sorellesupplements.com' },
  { n: 4, company: 'Enzodoor', name: 'Rosan', intended: 'info@enzodoor.nl' },
  { n: 5, company: 'Opmaat', name: '', intended: 'info@opmaatrecruitment.nl' },
]

function body(m) {
  const hey = m.name ? `Hey ${m.name},` : 'Hey,'
  return `${hey}\n\nHoe zou ${m.company} eruitzien als klantenservice geautomatiseerd is?\n\nWij zijn koning in klantenservice automatiseren. Wil jij dat ook?\n\n${cta}\n\nMike\nBotBuildr — https://botbuildr.ai`
}

const secret = process.env.OUTREACH_API_SECRET
if (secret) {
  for (const m of mails) {
    const res = await fetch('https://botbuildr.ai/api/outreach', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        previewTo,
        subject: `[TEST Resend ${m.n}/5] ${m.company} — klantenservice automatiseren?`,
        body: `PREVIEW — beoogde ontvanger: ${m.intended}\n\n---\n\n${body(m)}`,
        attachPitchDeck: true,
      }),
    })
    const data = await res.json().catch(() => ({}))
    console.log(`${m.n}/5 ${m.company}: HTTP ${res.status} attached=${data.attachedPitchDeck} id=${data.id || '—'}`)
    if (!res.ok) console.log(data)
    await new Promise((r) => setTimeout(r, 1000))
  }
  process.exit(0)
}

const resendKey = process.env.RESEND_API_KEY
if (!resendKey) {
  console.error('No OUTREACH_API_SECRET or RESEND_API_KEY in environment.')
  process.exit(1)
}

const from = process.env.OUTREACH_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || 'Mike van BotBuildr <hello@botbuildr.ai>'
const replyTo = process.env.OUTREACH_REPLY_TO || process.env.CONTACT_TO_EMAIL || 'botbuildr.ai@outlook.com'
const pdfPath = path.join(__dirname, '../public/pitch-deck.pdf')
const pdfB64 = fs.readFileSync(pdfPath).toString('base64')
const footer = '\n\n---\nWil je geen mails meer ontvangen? Antwoord met STOP — dan benaderen we je niet meer.'

for (const m of mails) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [previewTo],
      reply_to: replyTo,
      subject: `[TEST Resend ${m.n}/5] ${m.company} — klantenservice automatiseren?`,
      text: `PREVIEW — beoogde ontvanger: ${m.intended}\n\n---\n\n${body(m)}${footer}`,
      headers: { 'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>` },
      attachments: [{ filename: 'BotBuildr-Pitch-Deck.pdf', content: pdfB64 }],
    }),
  })
  const data = await res.json().catch(() => ({}))
  console.log(`${m.n}/5 ${m.company}: HTTP ${res.status} id=${data.id || data.message || '—'}`)
  if (!res.ok) console.log(data)
  await new Promise((r) => setTimeout(r, 1000))
}
