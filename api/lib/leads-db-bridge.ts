/**
 * leads-db-bridge.ts — best-effort bridge from the Vercel website functions
 * into the shared lib `infra/vps/lib/leads-db/` (docs/architecture/LEADS-SCHEMA.md
 * §0: all leads/tracking/A-B reads+writes go through that lib, never raw SQL).
 *
 * This is a cross-package relative import into a sibling part of the same
 * monorepo — it only works if Vercel's build actually traces + bundles
 * infra/vps/lib/leads-db/** (and its `pg` dependency under
 * infra/vps/scripts/node_modules/pg) into this function's deployment. That's
 * expected for a git-based deploy of the full repo, but has NOT been
 * smoke-tested against a live Vercel deploy yet — see the "Mike-todo" in
 * docs/ops/tracking-dns-checklist.md. Every call site using this bridge
 * degrades to a safe no-op on import failure or missing DB config, so a
 * bundling problem in production never breaks mail sending or the
 * pixel/redirect responses — it only means A/B assignment + tracking
 * silently fall back to local, unrecorded behaviour until fixed.
 */

// Minimal shape of the leads-db public API this bridge actually uses —
// kept loose (not a full re-declaration of infra/vps/lib/leads-db/index.mjs)
// so this file has no build-time dependency on that package's types.
export type LeadsDbModule = {
  assignAb: (
    leadId: number,
    testKey: string,
    options: { agent: string },
  ) => Promise<{ variant_key: string }>
  getLead: (idOrEmail: number | string) => Promise<{ enrichment?: unknown } | null>
  recordEmailEvent: (params: {
    leadId?: number | null
    eventType: 'open' | 'click'
    agent: string
    campaignId?: string | null
    messageId?: string | null
    url?: string | null
    variantKey?: string | null
    userAgent?: string | null
    ip?: string | null
  }) => Promise<unknown>
}

let cached: LeadsDbModule | null | undefined

function hasDbEnv(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.PGPASSWORD)
}

/** Reset the cached module — test-only escape hatch. */
export function resetLeadsDbBridgeCache(): void {
  cached = undefined
}

export async function loadLeadsDb(): Promise<LeadsDbModule | null> {
  if (cached !== undefined) return cached
  if (!hasDbEnv()) {
    cached = null
    return cached
  }
  try {
    // Literal path (not a variable) so bundlers that statically trace
    // dynamic import() calls (Vercel's build) can discover + include the
    // target file graph.
    // @ts-expect-error cross-package .mjs import has no .d.ts — see file header
    cached = (await import('../../../../infra/vps/lib/leads-db/index.mjs')) as unknown as LeadsDbModule
  } catch (err) {
    console.error('[leads-db-bridge] import of infra/vps/lib/leads-db failed — falling back to no-op:', err)
    cached = null
  }
  return cached
}
