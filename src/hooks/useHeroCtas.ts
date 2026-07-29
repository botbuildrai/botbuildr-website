import { useEffect } from 'react'
import { getTranslations } from '../i18n/translations'
import type { Locale } from '../i18n/types'

/** Hero CTAs live outside React markup — keep in sync when locale changes. */
export function useHeroCtas(locale: Locale) {
  useEffect(() => {
    const t = getTranslations(locale).hero
    const primary = document.querySelector('.hero .actions .btn-primary')
    const secondary = document.querySelector('.hero .actions .btn-link')
    const fold = document.querySelector('.fold-cue')

    if (primary) primary.textContent = t.ctaPrimary
    if (secondary) {
      secondary.innerHTML = `${t.ctaSecondary} <span class="arr">→</span>`
    }
    if (fold) fold.innerHTML = `<span class="arr">↓</span>${t.foldCue}`
  }, [locale])
}
