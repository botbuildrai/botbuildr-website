/**
 * Deliverability test v2 — geen bijlage, subject A/B/C.
 * Run: node scripts/send-deliverability-test.mjs  (reads .env.local)
 */
const previewTo = 'mike.tromp96@gmail.com'

const secret = process.env.OUTREACH_API_SECRET
if (!secret) {
  console.error('OUTREACH_API_SECRET ontbreekt — zet in .env.local')
  process.exit(1)
}

const res = await fetch('https://botbuildr.ai/api/outreach-deliverability-test', {
  method: 'POST',
  headers: { Authorization: `Bearer ${secret}` },
})

const data = await res.json().catch(() => ({}))
console.log('HTTP', res.status)
console.log(JSON.stringify(data, null, 2))
