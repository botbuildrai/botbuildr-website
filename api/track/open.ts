/**
 * /api/track/open — 1x1 open-pixel for cold outreach (spec §9 WS2, placeholder
 * host track.botbuildr.ai — see docs/ops/tracking-dns-checklist.md).
 *
 * Always returns the pixel immediately, even if DB recording fails — a
 * tracking hiccup must never show a broken image or delay the inbox render.
 * Query params: lid (leadId), cid (campaignId), mid (messageId), v (variantKey).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadLeadsDb } from '../lib/leads-db-bridge.js'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

async function recordOpen(req: VercelRequest): Promise<void> {
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
    eventType: 'open',
    agent: 'track-open-pixel',
    campaignId: firstHeaderValue(cid) ?? null,
    messageId: firstHeaderValue(mid) ?? null,
    variantKey: firstHeaderValue(v) ?? null,
    userAgent: userAgent ?? null,
    ip: ip ?? null,
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'image/gif')
  res.setHeader('Cache-Control', 'no-store, private')
  res.setHeader('Content-Length', String(PIXEL.length))
  // Flush the pixel to the client immediately — the function invocation
  // stays alive until this handler's promise settles, so the recordOpen()
  // await below still lands even though the response already went out.
  res.status(200).end(PIXEL)

  try {
    await recordOpen(req)
  } catch (err) {
    console.error('[track/open] recordEmailEvent failed:', err)
  }
}
