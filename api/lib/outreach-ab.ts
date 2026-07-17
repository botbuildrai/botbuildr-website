/**
 * outreach-ab.ts — resolves the three outreach A/B variants for a lead by
 * calling assignAb() against Postgres (via leads-db-bridge), with a
 * deterministic local fallback when there's no leadId or no DB configured
 * (e.g. local preview / outreach-preview.ts, or bundling failure — see
 * leads-db-bridge.ts header).
 *
 * Spec: docs/superpowers/specs/2026-07-17-sales-team-upgrade-design.md §9 WS2
 * ("A/B via ab_assignments: subject, opening, plan_format — wire assignAb
 * when sending").
 */

import { loadLeadsDb } from './leads-db-bridge.js'
import type { OutreachHooks } from './outreach-template.js'

export type VariantSource = 'ab_assignments' | 'fallback'

export type ResolvedVariant = { key: string; source: VariantSource }

export type ResolvedVariants = {
  subject: ResolvedVariant
  opening: ResolvedVariant
  planFormat: ResolvedVariant
  hooks: OutreachHooks | null
}

const KNOWN_REVIEW_THEMES = new Set(['slow_response', 'no_response', 'rude'])

function hashIndex(company: string, mod: number): number {
  let hash = 0
  for (let i = 0; i < company.length; i++) hash = (hash + company.charCodeAt(i)) % 997
  return hash % mod
}

function fallbackVariants(company: string): ResolvedVariants {
  return {
    subject: { key: hashIndex(company, 2) === 0 ? 'A' : 'B', source: 'fallback' },
    opening: { key: 'A', source: 'fallback' },
    planFormat: { key: 'A', source: 'fallback' },
    hooks: null,
  }
}

function extractHooks(enrichment: unknown): OutreachHooks | null {
  if (!enrichment || typeof enrichment !== 'object') return null
  const e = enrichment as { vacancies?: unknown[]; bad_reviews?: unknown[] }
  const vacancies = Array.isArray(e.vacancies) ? e.vacancies : []
  const badReviews = Array.isArray(e.bad_reviews) ? e.bad_reviews : []

  const vacancy = (vacancies.find((v) => (v as { ai_fit?: boolean } | null)?.ai_fit) ?? vacancies[0]) as
    | { title?: string }
    | undefined
  const review = badReviews[0] as { theme?: string } | undefined

  if (!vacancy?.title && !review) return null

  const badReviewTheme = review ? (review.theme && KNOWN_REVIEW_THEMES.has(review.theme) ? review.theme : 'slow_response') : undefined

  return {
    vacancyTitle: vacancy?.title,
    badReviewTheme,
  }
}

/**
 * @param leadId - botbuildr.leads.id, or null when there's no lead context (e.g. manual preview send)
 * @param company - used for the deterministic fallback hash when leadId/DB are unavailable
 * @param agent - recorded on the ab_assignments' lead_events row (spec §5.2)
 */
export async function resolveVariantsForLead(leadId: number | null, company: string, agent: string): Promise<ResolvedVariants> {
  if (!leadId) return fallbackVariants(company)

  const db = await loadLeadsDb()
  if (!db) return fallbackVariants(company)

  try {
    const [subjectAssignment, openingAssignment, planFormatAssignment, lead] = await Promise.all([
      db.assignAb(leadId, 'outreach_subject_v1', { agent }),
      db.assignAb(leadId, 'outreach_opening_v1', { agent }),
      db.assignAb(leadId, 'outreach_plan_format_v1', { agent }),
      db.getLead(leadId),
    ])
    return {
      subject: { key: subjectAssignment.variant_key, source: 'ab_assignments' },
      opening: { key: openingAssignment.variant_key, source: 'ab_assignments' },
      planFormat: { key: planFormatAssignment.variant_key, source: 'ab_assignments' },
      hooks: extractHooks(lead?.enrichment),
    }
  } catch (err) {
    console.error('[outreach-ab] assignAb/getLead failed — falling back to local A/B picks:', err)
    return fallbackVariants(company)
  }
}
