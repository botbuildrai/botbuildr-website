import { useEffect } from 'react'
import { contactFormLabels } from '../i18n/localizeMarkup'
import { SERVICE_IDS } from '../i18n/services'
import type { ServiceId } from '../i18n/services'
import type { Locale } from '../i18n/types'

function updateServicePrompt(form: HTMLFormElement, locale: Locale) {
  const t = contactFormLabels(locale)
  const select = form.querySelector<HTMLSelectElement>('select[name="service"]')
  const prompt = form.querySelector('#service-prompt')
  if (!prompt) return

  const service = select?.value as ServiceId | ''
  const text =
    service && t.prompts[service] ? t.prompts[service] : t.messageDefault
  prompt.textContent = text
}

function syncFormLabels(form: HTMLFormElement, locale: Locale) {
  const t = contactFormLabels(locale)
  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null
  const select = form.querySelector<HTMLSelectElement>('select[name="service"]')
  const placeholder = select?.querySelector('option[value=""]')

  if (submitBtn && !submitBtn.disabled) submitBtn.textContent = t.submit
  if (placeholder) placeholder.textContent = t.servicePlaceholder

  for (const id of SERVICE_IDS) {
    const opt = select?.querySelector(`option[value="${id}"]`)
    if (opt) opt.textContent = t.services[id]
  }

  const labels: [string, string][] = [
    ['name', t.name],
    ['email', t.email],
    ['company', t.company],
    ['service', t.serviceLabel],
  ]
  for (const [name, text] of labels) {
    const field = form.querySelector(`[name="${name}"]`)?.closest('.form-field')
    const label = field?.querySelector('.form-label:not(#service-prompt)')
    if (label) label.textContent = text
  }

  updateServicePrompt(form, locale)
}

export function useContactForm(locale: Locale) {
  useEffect(() => {
    const form = document.getElementById('contact-form') as HTMLFormElement | null
    if (!form) return

    const t = contactFormLabels(locale)
    const status = form.querySelector('.form-status') as HTMLElement | null
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null
    const serviceSelect = form.querySelector<HTMLSelectElement>('select[name="service"]')

    syncFormLabels(form, locale)

    const onServiceChange = () => updateServicePrompt(form, locale)

    const onSubmit = async (e: Event) => {
      e.preventDefault()
      if (!submitBtn) return

      const data = new FormData(form)
      const service = String(data.get('service') || '')
      if (!service) {
        serviceSelect?.focus()
        return
      }

      const payload = {
        name: String(data.get('name') || ''),
        email: String(data.get('email') || ''),
        company: String(data.get('company') || ''),
        service,
        message: String(data.get('message') || ''),
        locale,
      }

      submitBtn.disabled = true
      submitBtn.textContent = t.sending
      if (status) {
        status.textContent = ''
        status.className = 'form-status'
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('failed')
        form.reset()
        syncFormLabels(form, locale)
        if (status) {
          status.textContent = t.success
          status.className = 'form-status ok'
        }
      } catch {
        if (status) {
          status.textContent = t.error
          status.className = 'form-status err'
        }
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = t.submit
      }
    }

    serviceSelect?.addEventListener('change', onServiceChange)
    form.addEventListener('submit', onSubmit)
    return () => {
      serviceSelect?.removeEventListener('change', onServiceChange)
      form.removeEventListener('submit', onSubmit)
    }
  }, [locale])
}
