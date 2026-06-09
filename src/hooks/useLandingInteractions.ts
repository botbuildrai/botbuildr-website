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

function isMobileViewport() {
  return (
    document.documentElement.clientWidth <= 767 ||
    window.matchMedia('(max-width: 767px)').matches
  )
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function viewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight
}

function configureVideoElement(video: HTMLVideoElement) {
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('preload', 'auto')
  video.style.display = 'block'
}

async function primeVideoForScrub(video: HTMLVideoElement) {
  configureVideoElement(video)
  try {
    await video.play()
    video.pause()
    video.currentTime = 0
    return true
  } catch {
    return new Promise<boolean>((resolve) => {
      const onTouch = async () => {
        document.removeEventListener('touchstart', onTouch, true)
        try {
          await video.play()
          video.pause()
          video.currentTime = 0
          resolve(true)
        } catch {
          resolve(false)
        }
      }
      document.addEventListener('touchstart', onTouch, { once: true, passive: true, capture: true })
    })
  }
}

function loadHeroVideo(video: HTMLVideoElement, mobile: boolean) {
  const src = '/assets/botbuildr-iss-hero.mp4'
  video.removeAttribute('src')

  // Mobile: direct URL loads faster and iOS range-seeks better than waiting for full blob
  if (mobile) {
    video.src = src
    return Promise.resolve()
  }

  return fetch(src)
    .then((r) => r.blob())
    .then((blob) => {
      video.src = URL.createObjectURL(blob)
    })
    .catch(() => {
      video.src = src
    })
}

function seekVideo(video: HTMLVideoElement, time: number) {
  try {
    if (typeof video.fastSeek === 'function') {
      video.fastSeek(time)
    } else {
      video.currentTime = time
    }
  } catch {
    /* noop */
  }
}

function initScrollVideo(reduceMotion: boolean) {
  const section = document.getElementById('video-hero')
  const video = document.getElementById('hero-motion') as HTMLVideoElement | null
  const hint = document.getElementById('video-hero-hint')
  if (!section || !video) return

  const mobile = isMobileViewport()
  const poster = section.querySelector<HTMLElement>('.hero-poster, [data-hero-poster], img[id*="poster"]')
  if (poster) poster.style.display = 'none'

  configureVideoElement(video)

  const syncHeight = () => {
    if (reduceMotion) {
      section.style.height = '100vh'
    } else if (mobile) {
      section.style.height = '300vh'
    } else {
      section.style.height = ''
    }
  }
  syncHeight()

  let duration = 0
  let targetTime = 0
  let currentTime = 0
  let rafId: number | null = null
  let ready = false
  const scrubEase = mobile ? 0.42 : 0.22

  const computeProgress = () => {
    const vh = viewportHeight()
    const scrollY = window.scrollY || document.documentElement.scrollTop
    const sectionTop = section.offsetTop
    const total = section.offsetHeight - vh
    if (total <= 0) return 0
    const scrolled = scrollY - sectionTop
    return Math.min(1, Math.max(0, scrolled / total))
  }

  const tick = () => {
    rafId = null
    if (!ready) return
    const diff = targetTime - currentTime
    if (Math.abs(diff) > 0.005) {
      currentTime += diff * scrubEase
      seekVideo(video, currentTime)
      rafId = requestAnimationFrame(tick)
    } else {
      currentTime = targetTime
      seekVideo(video, currentTime)
    }
  }

  const update = () => {
    if (reduceMotion || !ready) return

    const p = computeProgress()
    if (duration > 0) targetTime = p * duration

    if (hint) {
      const h = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.2)
      hint.style.opacity = String(h)
    }

    if (rafId == null) rafId = requestAnimationFrame(tick)
  }

  const onReady = async () => {
    duration = Math.max(0.001, video.duration || 0)

    if (reduceMotion) {
      section.style.height = '100vh'
      seekVideo(video, Math.max(0, duration - 0.08))
      return
    }

    if (mobile || isIOS()) {
      await primeVideoForScrub(video)
    }

    video.pause()
    video.currentTime = 0
    currentTime = 0
    ready = true
    update()
  }

  const onResize = () => {
    syncHeight()
    update()
  }

  void loadHeroVideo(video, mobile).then(() => {
    if (video.readyState >= 1) void onReady()
    else video.addEventListener('loadedmetadata', () => void onReady(), { once: true })
  })

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', onResize)
  window.visualViewport?.addEventListener('resize', onResize)
  window.visualViewport?.addEventListener('scroll', update, { passive: true })

  if (mobile) {
    window.addEventListener('touchmove', update, { passive: true })
  }

  return () => {
    video.removeEventListener('loadedmetadata', onReady)
    window.removeEventListener('scroll', update)
    window.removeEventListener('touchmove', update)
    window.removeEventListener('resize', onResize)
    window.visualViewport?.removeEventListener('resize', onResize)
    window.visualViewport?.removeEventListener('scroll', update)
    if (rafId != null) cancelAnimationFrame(rafId)
    section.style.height = ''
    ready = false
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
