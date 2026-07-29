import { getTranslations } from './translations'
import type { Locale, Translations } from './types'

function collectStringPairs(
  en: Record<string, unknown>,
  nl: Record<string, unknown>,
  pairs: [string, string][] = [],
): [string, string][] {
  for (const key of Object.keys(en)) {
    const a = en[key]
    const b = nl[key]
    if (typeof a === 'string' && typeof b === 'string' && a !== b) {
      pairs.push([a, b])
    } else if (a && b && typeof a === 'object' && typeof b === 'object') {
      collectStringPairs(
        a as Record<string, unknown>,
        b as Record<string, unknown>,
        pairs,
      )
    }
  }
  return pairs
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replacePair(out: string, from: string, to: string) {
  out = out.replace(new RegExp(escapeRegex(from), 'g'), to)
  if (from.startsWith('>')) {
    const fromEntity = `&gt;${from.slice(1)}`
    const toEntity = `&gt;${to.slice(1)}`
    out = out.replace(new RegExp(escapeRegex(fromEntity), 'g'), toEntity)
  }
  return out
}

export function localizeMarkup(html: string, locale: Locale): string {
  if (locale === 'en') return html
  const en = getTranslations('en') as unknown as Record<string, unknown>
  const nl = getTranslations('nl') as unknown as Record<string, unknown>
  const pairs = collectStringPairs(en, nl).sort((a, b) => b[0].length - a[0].length)
  let out = html
  for (const [from, to] of pairs) {
    out = replacePair(out, from, to)
  }
  return out
}

export function contactFormLabels(locale: Locale): Translations['contact'] {
  return getTranslations(locale).contact
}
