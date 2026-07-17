import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import {
  buildOutreachMail,
  UNSUBSCRIBE_FOOTER_TEXT,
  CALENDLY_URL,
  type SubjectVariantId,
  type OpeningVariantId,
  type PlanFormatVariantId,
} from './lib/outreach-template.js'
import { resolveVariantsForLead } from './lib/outreach-ab.js'
import { buildOpenPixelUrl, wrapClickUrl } from './lib/tracking-links.js'
import { loadLeadsDb } from './lib/leads-db-bridge.js'

type OutreachAttachment = {
  filename: string
  /** Base64-encoded file content */
  content: string
}

type OutreachPayload = {
  to?: string
  subject?: string
  body?: string
  name?: string
  company?: string
  type?: string
  segment?: 'trades' | 'default'
  previewTo?: string
  /** botbuildr.leads.id — when set, wires assignAb() for subject/opening/plan_format (spec §9 WS2) */
  leadId?: number | string
  subjectVariant?: SubjectVariantId | number
  /** Explicit override; otherwise resolved via assignAb (or a deterministic fallback without leadId/DB). */
  openingVariant?: OpeningVariantId
  /** Explicit override; otherwise resolved via assignAb (or a deterministic fallback without leadId/DB). */
  planFormat?: PlanFormatVariantId
  /** @deprecated Bijlagen verwijderd op cold outreach — deliverability. Genegeerd tenzij warm. */
  attachPitchDeck?: boolean
  /** Warm reply (plan op maat): mag PDF-bijlage meesturen via Resend */
  warm?: boolean
  /** AI-plan PDF (infra/vps/scripts/generate-ai-plan-pdf.mjs), base64 — only used when planFormat resolves to 'B' */
  attachments?: OutreachAttachment[]
}

const CAMPAIGN_ID = 'outreach_cold_v2'

function trackingId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `t${Date.now()}${Math.random().toString(36).slice(2)}`
  }
}

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

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as OutreachPayload
  const to = String(body.previewTo || body.to || '').trim()
  const company = String(body.company || '').trim()
  const leadId = body.leadId ? Number(body.leadId) : null

  if (!to) {
    return res.status(400).json({ error: 'Missing to' })
  }

  // Suppression / opt-out gate. When DATABASE_URL is configured and the bridge
  // loads, a confirmed match always blocks. Bridge/DB errors fail CLOSED
  // (refuse send) so opt-out cannot be bypassed by an infra hiccup.
  const leadsDb = await loadLeadsDb()
  if (leadsDb) {
    try {
      const suppressed = await leadsDb.isEmailSuppressed(to)
      if (suppressed) {
        return res.status(403).json({ error: 'Email is suppressed (opt-out) — refusing to send' })
      }
      if (leadId) {
        const lead = await leadsDb.getLead(leadId)
        if (lead?.status === 'NIET_BENADEREN') {
          return res.status(403).json({ error: 'Lead status is NIET_BENADEREN — refusing to send' })
        }
      }
    } catch (err) {
      console.error('[outreach] suppression check failed — failing closed:', err)
      return res.status(503).json({ error: 'Suppression check unavailable — refusing to send' })
    }
  }

  let subject = String(body.subject || '').trim()
  let text = String(body.body || '').trim()
  let html: string | undefined
  let subjectVariant: SubjectVariantId | undefined
  let openingVariant: OpeningVariantId | undefined
  let planFormat: PlanFormatVariantId | undefined
  let variantSource: 'ab_assignments' | 'fallback' | 'override' = 'override'

  const isWarm = body.warm === true
  const attachments = Array.isArray(body.attachments) ? body.attachments : []

  if (!subject || !text) {
    if (!company) {
      return res.status(400).json({ error: 'Missing company (or provide subject + body)' })
    }

    const resolved = await resolveVariantsForLead(leadId, company, 'api-outreach')
    subjectVariant = (body.subjectVariant as SubjectVariantId | undefined) || (resolved.subject.key as SubjectVariantId)
    openingVariant = body.openingVariant || (resolved.opening.key as OpeningVariantId)
    const assignedPlanFormat = body.planFormat || (resolved.planFormat.key as PlanFormatVariantId)
    variantSource = body.subjectVariant || body.openingVariant || body.planFormat ? 'override' : resolved.subject.source

    // Never let the copy claim "plan in de bijlage" (planFormat B) unless a
    // PDF is actually attached — the ab_assignments row still reflects the
    // real assignment either way; only the *copy* downgrades (spec §9 WS2 /
    // 03-constraints.md: "PDF alleen als bewuste variant, nooit stilzwijgend").
    const pdfActuallyAttached = assignedPlanFormat === 'B' && attachments.length > 0
    planFormat = pdfActuallyAttached ? 'B' : 'A'

    const tid = trackingId()
    const openPixelUrl = buildOpenPixelUrl({ leadId, campaignId: CAMPAIGN_ID, messageId: tid, variantKey: subjectVariant })
    const calendlyHref = wrapClickUrl(CALENDLY_URL, { leadId, campaignId: CAMPAIGN_ID, messageId: tid, variantKey: planFormat })

    const mail = buildOutreachMail({
      name: body.name,
      company,
      type: body.type,
      segment: body.segment,
      subjectVariant,
      openingVariant,
      planFormat,
      hooks: resolved.hooks,
      tracking: { openPixelUrl, calendlyHref },
    })
    subject = mail.subject
    text = mail.text
    html = mail.html
  }

  const from =
    process.env.OUTREACH_FROM_EMAIL || 'Mike van BotBuildr <hello@botbuildr.ai>'
  const replyTo = process.env.OUTREACH_REPLY_TO || 'botbuildr.ai@outlook.com'

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    reply_to: replyTo,
    subject,
    text: text + UNSUBSCRIBE_FOOTER_TEXT,
    headers: {
      'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>`,
    },
  }

  if (html) {
    payload.html = html.replace(
      '</body>',
      `<p style="margin: 1.5em 0 0; font-size: 13px; color: #666;">Wil je geen mails meer ontvangen? Antwoord met STOP.</p></body>`,
    )
  }

  // Attachments allowed on warm replies (existing pitch-deck-on-reply flow)
  // OR on the deliberate plan_format B cold-send exception (spec §9 WS2 /
  // 03-constraints.md PDF A/B nuance) — never silently for everyone else.
  const attachmentsAllowed = isWarm || planFormat === 'B'
  if (!attachmentsAllowed && attachments.length > 0) {
    return res.status(400).json({
      error: 'Attachments only allowed on warm replies (warm: true) or plan_format B (AI-plan PDF) sends',
    })
  }

  if (attachmentsAllowed && attachments.length > 0) {
    payload.attachments = attachments
      .filter((a) => a?.filename && a?.content)
      .map((a) => ({
        filename: String(a.filename),
        content: String(a.content),
      }))
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

    if (!response.ok) {
      const detail = await response.text()
      console.error('[outreach] Resend error:', detail)
      return res.status(502).json({ error: 'Email delivery failed', detail })
    }

    const data = (await response.json()) as { id?: string }
    return res.status(200).json({
      ok: true,
      id: data.id,
      subject,
      subjectVariant: subjectVariant ?? null,
      openingVariant: openingVariant ?? null,
      planFormat: planFormat ?? null,
      variantSource,
      leadId,
      attachedPitchDeck: isWarm && attachments.length > 0,
      attachedAiPlanPdf: planFormat === 'B' && attachments.length > 0,
      warm: isWarm,
      from,
    })
  } catch (err) {
    console.error('[outreach]', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
