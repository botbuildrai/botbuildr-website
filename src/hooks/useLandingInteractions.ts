import { useEffect } from 'react'

function countUp(el: HTMLElement, reduce: boolean) {
  const target = parseFloat(el.dataset.count || '0')
  const dec = parseInt(el.dataset.dec || '0', 10)
  const suffix = el.dataset.suffix || ''
  if (reduce) {
    el.textContent = target.toFixed(dec) + suffix
    return
  }
  const dur = 1100
  const t0 = performance.now()
  const frame = (now: number) => {
    const p = Math.min((now - t0) / dur, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = (target * eased).toFixed(dec) + suffix
    if (p < 1) requestAnimationFrame(frame)
    else el.textContent = target.toFixed(dec) + suffix
  }
  requestAnimationFrame(frame)
}

function initScrollVideo(reduceMotion: boolean) {
  const section = document.getElementById('video-hero')
  const video = document.getElementById('hero-motion') as HTMLVideoElement | null
  const hint = document.getElementById('video-hero-hint')
  if (!section || !video) return

  const src = '/assets/botbuildr-iss-hero.mp4'
  video.removeAttribute('src')
  fetch(src)
    .then((r) => r.blob())
    .then((blob) => {
      video.src = URL.createObjectURL(blob)
    })
    .catch(() => {
      video.src = src
    })

  try {
    video.pause()
  } catch {
    /* noop */
  }
  video.currentTime = 0

  let duration = 0
  let targetTime = 0
  let currentTime = 0
  let rafId: number | null = null

  const computeProgress = () => {
    const rect = section.getBoundingClientRect()
    const total = section.offsetHeight - window.innerHeight
    if (total <= 0) return 0
    return Math.min(1, Math.max(0, -rect.top / total))
  }

  const tick = () => {
    rafId = null
    const diff = targetTime - currentTime
    if (Math.abs(diff) > 0.005) {
      currentTime += diff * 0.22
      try {
        video.currentTime = currentTime
      } catch {
        /* noop */
      }
      rafId = requestAnimationFrame(tick)
    } else {
      currentTime = targetTime
      try {
        video.currentTime = currentTime
      } catch {
        /* noop */
      }
    }
  }

  const update = () => {
    const p = computeProgress()
    if (duration > 0) targetTime = p * duration

    if (hint) {
      const h = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.2)
      hint.style.opacity = String(h)
    }

    if (rafId == null) rafId = requestAnimationFrame(tick)
  }

  const onMeta = () => {
    duration = Math.max(0.001, video.duration || 0)
    try {
      video.pause()
    } catch {
      /* noop */
    }
    video.currentTime = 0
    update()
  }

  video.addEventListener('loadedmetadata', onMeta)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)

  if (reduceMotion) {
    window.removeEventListener('scroll', update)
    section.style.height = '100vh'
  }

  return () => {
    video.removeEventListener('loadedmetadata', onMeta)
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
    if (rafId != null) cancelAnimationFrame(rafId)
  }
}

export function useLandingInteractions() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const cleanupVideo = initScrollVideo(reduce)

    const hero = document.querySelector('.hero.video-handoff')
    let heroObs: IntersectionObserver | undefined
    if (hero) {
      heroObs = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              heroObs?.disconnect()
            }
          })
        },
        { threshold: 0.15 },
      )
      heroObs.observe(hero)
    }

    const statObs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            countUp(e.target as HTMLElement, reduce)
            statObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.6 },
    )
    document.querySelectorAll('[data-count]').forEach((el) => statObs.observe(el))

    const revObs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            revObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal').forEach((el) => revObs.observe(el))

    return () => {
      cleanupVideo?.()
      heroObs?.disconnect()
      statObs.disconnect()
      revObs.disconnect()
    }
  }, [])
}
