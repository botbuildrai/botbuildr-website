import { useEffect } from 'react'
import type { Locale } from '../i18n/types'
import { CALENDLY_URL } from '../config/calendly'

const labels = {
  en: {
    divider: 'or book a call directly',
    cta: '> book 30-min strategy call',
    finalCta: '> book a build call',
  },
  nl: {
    divider: 'of plan direct een gesprek',
    cta: '> plan 30 min strategiegesprek',
    finalCta: '> plan een strategiegesprek',
  },
} as const

function wireCalendlyLink(el: HTMLAnchorElement, url: string, label: string) {
  el.href = url
  el.target = '_blank'
  el.rel = 'noopener noreferrer'
  el.textContent = label
  el.hidden = false
}

export function useCalendlyLink(locale: Locale) {
  useEffect(() => {
    const t = labels[locale]
    const url = CALENDLY_URL

    const book = document.getElementById('calendly-book') as HTMLAnchorElement | null
    const divider = document.getElementById('calendly-divider')
    const finalBtn = document.getElementById('calendly-final') as HTMLAnchorElement | null

    if (book) wireCalendlyLink(book, url, t.cta)
    if (divider) {
      divider.textContent = t.divider
      divider.hidden = false
    }
    if (finalBtn) wireCalendlyLink(finalBtn, url, t.finalCta)

    document.querySelectorAll<HTMLAnchorElement>('[data-calendly]').forEach((el) => {
      wireCalendlyLink(el, url, el.dataset.calendlyLabel || t.finalCta)
    })
  }, [locale])
}
