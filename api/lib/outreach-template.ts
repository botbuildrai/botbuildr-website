/**
 * Deliverability-safe cold outreach template — warm, direct, outcome-first
 * (docs/context/02-voice.md), no price (voice.md "Don't": geen prijsdiscussie
 * in eerste mail). Kept plain/serif in HTML on purpose: this should read like
 * a personal email, not a branded template — the on-brand look
 * (botbuildr-website/design.md) is reserved for the AI-plan PDF
 * (see infra/vps/scripts/generate-ai-plan-pdf.mjs), never the mail chrome.
 *
 * Three A/B axes, wired 1:1 to the seeded ab_tests rows (spec §9 WS2 +
 * infra/vps/migrations/2026-07-17-sales-team-upgrade.sql):
 *   - outreach_subject_v1     : subjectVariant  A | B
 *   - outreach_opening_v1     : openingVariant  A (generic) | B (enrichment hook)
 *   - outreach_plan_format_v1 : planFormat      A (pitch-deck link) | B (AI-plan PDF)
 *
 * This module does no I/O (no DB, no fs) — variant *assignment* (assignAb)
 * and DB-backed hooks live in ./outreach-ab.ts; this file only renders copy
 * for whichever variant keys it's given.
 */

export type OutreachSegment = 'trades' | 'default'
export type SubjectVariantId = 'A' | 'B'
export type OpeningVariantId = 'A' | 'B'
export type PlanFormatVariantId = 'A' | 'B'

export type OutreachHooks = {
  vacancyTitle?: string
  badReviewTheme?: string
}

export const CALENDLY_URL = 'https://calendly.com/botbuildr-ai'

const TRADE_TYPES = new Set([
  'loodgieter',
  'elektricien',
  'installateur',
  'schilder',
  'timmerman',
  'aannemer',
  'stukadoor',
  'dakdekker',
  'tegelzetter',
  'hovenier',
  'bouwbedrijf',
  'renovatie',
  'hvac',
])

export function detectOutreachSegment(input?: { segment?: OutreachSegment; type?: string }): OutreachSegment {
  if (input?.segment === 'trades' || input?.segment === 'default') return input.segment
  const t = (input?.type || '').toLowerCase()
  if (!t) return 'default'
  return [...TRADE_TYPES].some((k) => t.includes(k)) ? 'trades' : 'default'
}

/**
 * Two variants per segment — matches ab_tests.outreach_subject_v1.variants
 * exactly (A = direct question, B = outcome-first per the test's hypothesis).
 */
export const SUBJECT_VARIANTS: Record<OutreachSegment, { id: SubjectVariantId; label: string; build: (company: string) => string }[]> = {
  default: [
    { id: 'A', label: 'directe vraag', build: () => 'Klantenservice op autopilot?' },
    { id: 'B', label: 'outcome-first', build: (company) => `${company} — supportvragen in seconden beantwoord?` },
  ],
  trades: [
    { id: 'A', label: 'directe vraag', build: () => 'Gemiste oproepen opvangen?' },
    { id: 'B', label: 'outcome-first', build: (company) => `${company} — telefoon nooit meer gemist?` },
  ],
}

export function pickSubjectVariantForCompany(
  company: string,
  override?: SubjectVariantId | number,
  segment: OutreachSegment = 'default',
): { id: SubjectVariantId; subject: string } {
  const variants = SUBJECT_VARIANTS[segment]
  const index =
    override === 'A' || override === 0 ? 0 : override === 'B' || override === 1 ? 1 : hashIndex(company, variants.length)
  const variant = variants[index]
  return { id: variant.id, subject: variant.build(company) }
}

function hashIndex(company: string, mod: number): number {
  let hash = 0
  for (let i = 0; i < company.length; i++) hash = (hash + company.charCodeAt(i)) % 997
  return hash % mod
}

const REVIEW_THEME_COPY: Record<string, string> = {
  slow_response: 'trage reactietijd',
  no_response: 'gemiste berichten',
  rude: 'onvriendelijk contact',
}
const DEFAULT_REVIEW_THEME_COPY = 'trage reacties'

/** 1 opening line ("hook"). Variant B leans on an enrichment signal when one is available, else degrades to A. */
function buildOpening(segment: OutreachSegment, company: string, openingVariant: OpeningVariantId, hooks: OutreachHooks | null): string {
  if (openingVariant === 'B' && hooks) {
    if (hooks.vacancyTitle) {
      return `Ik zag dat ${company} op zoek is naar iemand voor "${hooks.vacancyTitle}" — een deel van dat werk kunnen we nu al automatiseren.`
    }
    if (hooks.badReviewTheme) {
      const theme = REVIEW_THEME_COPY[hooks.badReviewTheme] || DEFAULT_REVIEW_THEME_COPY
      return `Ik zag ${theme} genoemd worden in reviews over ${company} — dat lossen we als eerste op.`
    }
  }
  if (segment === 'trades') {
    return `Ik zag ${company} en vroeg me af: hoeveel aanvragen mis je als je op de klus staat en niet opneemt?`
  }
  return `Ik zag ${company} en vroeg me af: hoeveel van je klantvragen zijn eigenlijk altijd hetzelfde?`
}

/** Kernzin (docs/context/02-voice.md) + short pitch. No price — first-mail rule. */
function kernzin(planFormat: PlanFormatVariantId, company: string): string {
  const base = 'Wij zijn koning in klantenservice automatiseren — mail, WhatsApp, Instagram en live chat, 24/7, menselijk warm, geen robot-gevoel.'
  if (planFormat === 'B') {
    return `${base} Ik heb er een kort plan op maat voor ${company} bijgevoegd.`
  }
  return base
}

/** Exactly 1 question, per voice.md ("1 vraag, 1 volgende stap"). */
function question(segment: OutreachSegment): string {
  return segment === 'trades'
    ? 'Welk kanaal kost je nu de meeste tijd — telefoon, WhatsApp of mail?'
    : 'Welk kanaal kost jullie nu de meeste tijd — mail, WhatsApp of chat?'
}

function greeting(name?: string): string {
  return name?.trim() ? `Hey ${name.trim()},` : 'Hey,'
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type OutreachTracking = {
  /** Absolute open-pixel URL (track.botbuildr.ai) — omitted entirely if not provided (no pixel in text mail anyway). */
  openPixelUrl?: string
  /** Pre-wrapped click-redirect URL for the Calendly CTA; falls back to the plain CALENDLY_URL when absent. */
  calendlyHref?: string
}

export type OutreachMailInput = {
  name?: string
  company: string
  type?: string
  segment?: OutreachSegment
  subjectVariant?: SubjectVariantId | number
  openingVariant?: OpeningVariantId
  planFormat?: PlanFormatVariantId
  hooks?: OutreachHooks | null
  tracking?: OutreachTracking
}

export type OutreachMail = {
  subject: string
  text: string
  html: string
  subjectVariant: SubjectVariantId
  openingVariant: OpeningVariantId
  planFormat: PlanFormatVariantId
  segment: OutreachSegment
}

export function buildOutreachMail(input: OutreachMailInput): OutreachMail {
  const { name, company } = input
  const segment = detectOutreachSegment(input)
  const { id: subjectVariant, subject } = pickSubjectVariantForCompany(company, input.subjectVariant, segment)
  const openingVariant: OpeningVariantId = input.openingVariant === 'B' ? 'B' : 'A'
  const planFormat: PlanFormatVariantId = input.planFormat === 'B' ? 'B' : 'A'
  const calendlyHref = input.tracking?.calendlyHref || CALENDLY_URL

  const opening = buildOpening(segment, company, openingVariant, input.hooks ?? null)
  const kern = kernzin(planFormat, company)
  const vraag = question(segment)

  const text = `${greeting(name)}

${opening}

${kern}

${vraag}

Boek gerust 30 min, vrijblijvend: ${calendlyHref}

Mike — BotBuildr.ai`

  const paragraphs = [
    escapeHtml(greeting(name)),
    escapeHtml(opening),
    escapeHtml(kern),
    escapeHtml(vraag),
    `Boek gerust 30 min, vrijblijvend: <a href="${escapeHtml(calendlyHref)}" style="color:#066377;">${escapeHtml(CALENDLY_URL)}</a>`,
    'Mike — BotBuildr.ai',
  ]

  const pixel = input.tracking?.openPixelUrl
    ? `<img src="${escapeHtml(input.tracking.openPixelUrl)}" width="1" height="1" alt="" style="display:none;" />`
    : ''

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; line-height: 1.55; color: #1a1a1a; margin: 0; padding: 0;">
${paragraphs.map((p) => `<p style="margin: 0 0 1em;">${p}</p>`).join('\n')}
${pixel}</body>
</html>`

  return { subject, text, html, subjectVariant, openingVariant, planFormat, segment }
}

export const UNSUBSCRIBE_FOOTER_TEXT = `

---
Wil je geen mails meer ontvangen? Antwoord met STOP — dan benaderen we je niet meer.`
