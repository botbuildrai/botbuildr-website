import { useEffect } from 'react'

function fmt(v: number, dec: number) {
  return dec ? v.toFixed(dec) : Math.round(v).toString()
}

function setFinal(el: HTMLElement) {
  el.textContent =
    fmt(parseFloat(el.dataset.count || '0'), parseInt(el.dataset.dec || '0', 10)) +
    (el.dataset.suffix || '')
}

function countUp(el: HTMLElement, reduce: boolean) {
  const target = parseFloat(el.dataset.count || '0')
  const dec = parseInt(el.dataset.dec || '0', 10)
  const suf = el.dataset.suffix || ''
  if (reduce || !document.documentElement.classList.contains('animate')) {
    setFinal(el)
    return
  }
  const dur = 1100
  const t0 = performance.now()
  const frame = (now: number) => {
    const p = Math.min((now - t0) / dur, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = fmt(target * eased, dec) + suf
    if (p < 1) requestAnimationFrame(frame)
    else setFinal(el)
  }
  requestAnimationFrame(frame)
}

function resetCount(el: HTMLElement) {
  el.textContent = '0' + (el.dataset.suffix || '')
}

export function useLandingInteractions() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    root.lang = 'nl'

    const revObs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => e.target.classList.toggle('in', e.isIntersecting))
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
    )

    const cntObs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          const el = e.target as HTMLElement
          if (e.isIntersecting) countUp(el, reduce)
          else if (root.classList.contains('animate')) resetCount(el)
        })
      },
      { threshold: 0.45 },
    )

    const initObservers = () => {
      document.querySelectorAll('.reveal, .stag, .bars, .curve').forEach((el) => revObs.observe(el))
      document.querySelectorAll('[data-count]').forEach((el) => cntObs.observe(el))
    }

    const hint = document.getElementById('scrollHint')
    let hidden = false
    const onScroll = () => {
      if (!hidden && window.scrollY > 60) {
        hint?.classList.add('gone')
        hidden = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let settled = false
    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;'
    probe.style.animation = 'probe-fire .04s linear'

    const finish = (animate: boolean) => {
      if (settled) return
      settled = true
      if (animate) root.classList.add('animate')
      else document.querySelectorAll('[data-count]').forEach((el) => setFinal(el as HTMLElement))
      try {
        probe.remove()
      } catch {
        /* noop */
      }
      initObservers()
    }

    if (reduce) {
      document.querySelectorAll('[data-count]').forEach((el) => setFinal(el as HTMLElement))
      initObservers()
    } else {
      probe.addEventListener('animationend', () => finish(true), { once: true })
      document.body.appendChild(probe)
      setTimeout(() => finish(false), 500)
    }

    document.title = 'BotBuildr.ai — Klantcontact op autopilot'

    // stamboom / org chart interaction
    const EXAMPLES: Record<
      string,
      { label: string; incoming: { who: string; text: string }; reply: { who: string; text: string } }
    > = {
      a: {
        label: 'klantenservice · binnenkomend bericht',
        incoming: { who: 'WhatsApp — klant', text: 'Wat zijn jullie levertijden? Ik wil het deze week nog ontvangen.' },
        reply: {
          who: 'BotBuildr — direct verstuurd',
          text: 'Hoi! Standaard leveren we binnen 2–3 werkdagen. Express kan morgen al. Zal ik dat voor je omzetten?',
        },
      },
      b: {
        label: 'social media · binnenkomende DM',
        incoming: {
          who: 'Instagram DM — volger',
          text: 'Hoi! Werken jullie ook met bedrijven buiten Nederland?',
        },
        reply: {
          who: 'BotBuildr — direct verstuurd',
          text: 'Ja hoor — we helpen klanten in NL en daarbuiten. Zal ik je doorzetten naar iemand die je even belt?',
        },
      },
      c: {
        label: 'leads · automatische opvolging',
        incoming: { who: 'Systeem', text: 'Lead "Strategy call" — formulier 3 dagen geleden, nog geen afspraak.' },
        reply: {
          who: 'BotBuildr — automatisch opgevolgd',
          text: 'Hoi! Je vroeg vorige week naar BotBuildr — nog vragen, of zal ik een strategy call van 30 min voor je openzetten?',
        },
      },
    }

    const org = document.querySelector('.org')
    const dot = document.getElementById('orgDot')
    const detail = document.getElementById('orgDetail')
    const owner = document.querySelector('.org-owner')
    let orgRunning = false

    const moveDot = (x: number, y: number) => {
      if (dot) {
        dot.style.left = `${x}px`
        dot.style.top = `${y}px`
      }
    }

    const flowInto = (nodeEl: HTMLElement, key: string) => {
      if (!org || !dot || !detail || !owner || orgRunning) return
      orgRunning = true
      document.querySelectorAll('.org-node').forEach((n) => n.classList.remove('active'))
      nodeEl.classList.add('active')

      const cRect = org.getBoundingClientRect()
      const oRect = owner.getBoundingClientRect()
      const nRect = nodeEl.getBoundingClientRect()
      const start = { x: oRect.left + oRect.width / 2 - cRect.left, y: oRect.bottom - cRect.top }
      const mid = {
        x: nRect.left + nRect.width / 2 - cRect.left,
        y: (oRect.bottom + nRect.top) / 2 - cRect.top,
      }
      const end = { x: nRect.left + nRect.width / 2 - cRect.left, y: nRect.top - cRect.top + 6 }

      dot.style.display = 'block'
      moveDot(start.x, start.y)

      const showResult = () => {
        const ex = EXAMPLES[key]
        if (!ex) return
        detail.classList.remove('empty')
        detail.innerHTML =
          `<div class="od-lbl">// ${ex.label}</div>` +
          '<div class="od-msg">' +
          `<div class="od-bubble"><span class="who">${ex.incoming.who}</span>${ex.incoming.text}</div>` +
          `<div class="od-bubble reply"><span class="who">${ex.reply.who}</span>${ex.reply.text}</div>` +
          '</div>'
      }

      if (reduce || !root.classList.contains('animate')) {
        dot.style.display = 'none'
        nodeEl.classList.add('pulse')
        showResult()
        setTimeout(() => {
          nodeEl.classList.remove('pulse')
          orgRunning = false
        }, 500)
        return
      }

      const anim = dot.animate(
        [
          { left: `${start.x}px`, top: `${start.y}px`, opacity: 1 },
          { left: `${mid.x}px`, top: `${mid.y}px`, opacity: 1 },
          { left: `${end.x}px`, top: `${end.y}px`, opacity: 1 },
        ],
        { duration: 700, easing: 'cubic-bezier(.2,0,0,1)' },
      )
      anim.onfinish = () => {
        dot.style.display = 'none'
        nodeEl.classList.add('pulse')
        showResult()
        setTimeout(() => {
          nodeEl.classList.remove('pulse')
          orgRunning = false
        }, 500)
      }
    }

    const orgNodes = document.querySelectorAll<HTMLElement>('.org-node')
    const onOrgClick = (e: Event) => {
      const node = e.currentTarget as HTMLElement
      const key = node.dataset.node
      if (key) flowInto(node, key)
    }
    orgNodes.forEach((node) => node.addEventListener('click', onOrgClick))

    return () => {
      orgNodes.forEach((node) => node.removeEventListener('click', onOrgClick))
      revObs.disconnect()
      cntObs.disconnect()
      window.removeEventListener('scroll', onScroll)
      try {
        probe.remove()
      } catch {
        /* noop */
      }
      root.classList.remove('animate')
    }
  }, [])
}
