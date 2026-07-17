/**
 * /api/track/click — click-redirect for cold outreach links (spec §9 WS2,
 * placeholder host track.botbuildr.ai — see docs/ops/tracking-dns-checklist.md).
 *
 * Query params: u (target URL, required), lid (leadId), cid (campaignId),
 * mid (messageId), v (variantKey). `u` is restricted to an allowlist of
 * BotBuildr-controlled hosts so this endpoint can't be abused as an open
 * redirect.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadLeadsDb } from '../lib/leads-db-bridge.js'

const ALLOWED_REDIRECT_HOSTS = new Set(['botbuildr.ai', 'www.botbuildr.ai', 'calendly.com'])

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function resolveSafeTarget(raw: string | undefined): string | null {
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  if (!ALLOWED_REDIRECT_HOSTS.has(url.hostname)) return null
  return url.toString()
}

async function recordClick(req: VercelRequest, target: string): Promise<void> {
  const db = await loadLeadsDb()
  if (!db) return

  const { lid, cid, mid, v } = req.query as Record<string, string | string[] | undefined>
  const leadIdRaw = firstHeaderValue(lid)
  const leadId = leadIdRaw ? Number(leadIdRaw) : null
  if (leadId && Number.isNaN(leadId)) return

  const userAgent = firstHeaderValue(req.headers['user-agent'] as string | string[] | undefined)
  const forwardedFor = firstHeaderValue(req.headers['x-forwarded-for'] as string | string[] | undefined)
  const ip = forwardedFor?.split(',')[0]?.trim() || req.socket?.remoteAddress

  await db.recordEmailEvent({
    leadId,
    eventType: 'click',
    agent: 'track-click-redirect',
    campaignId: firstHeaderValue(cid) ?? null,
    messageId: firstHeaderValue(mid) ?? null,
    url: target,
    variantKey: firstHeaderValue(v) ?? null,
    userAgent: userAgent ?? null,
    ip: ip ?? null,
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { u } = req.query as Record<string, string | string[] | undefined>
  const target = resolveSafeTarget(firstHeaderValue(u))

  if (!target) {
    res.status(400).send('Invalid or missing "u" redirect target')
    return
  }

  res.setHeader('Cache-Control', 'no-store, private')
  res.status(302)
  res.setHeader('Location', target)
  res.end()

  try {
    await recordClick(req, target)
  } catch (err) {
    console.error('[track/click] recordEmailEvent failed:', err)
  }
}
