/**
 * tracking-links.ts — builds open-pixel + click-redirect URLs against the
 * placeholder tracking host `track.botbuildr.ai` (spec §9 WS2, decision 3A).
 *
 * DNS for track.botbuildr.ai is NOT live yet — see
 * docs/ops/tracking-dns-checklist.md. Until it is, these URLs point at a
 * host that doesn't resolve; TRACKING_HOST lets local/dev testing point at
 * the deployed botbuildr.ai domain instead (same /api/track/* routes).
 */

const TRACK_HOST = (process.env.TRACKING_HOST || 'https://track.botbuildr.ai').replace(/\/+$/, '')

export type TrackingParams = {
  leadId?: number | null
  campaignId?: string | null
  messageId?: string | null
  variantKey?: string | null
}

function paramsFrom({ leadId, campaignId, messageId, variantKey }: TrackingParams): URLSearchParams {
  const params = new URLSearchParams()
  if (leadId) params.set('lid', String(leadId))
  if (campaignId) params.set('cid', campaignId)
  if (messageId) params.set('mid', messageId)
  if (variantKey) params.set('v', variantKey)
  return params
}

export function buildOpenPixelUrl(input: TrackingParams): string {
  return `${TRACK_HOST}/api/track/open?${paramsFrom(input).toString()}`
}

export function wrapClickUrl(targetUrl: string, input: TrackingParams): string {
  const params = paramsFrom(input)
  params.set('u', targetUrl)
  return `${TRACK_HOST}/api/track/click?${params.toString()}`
}
