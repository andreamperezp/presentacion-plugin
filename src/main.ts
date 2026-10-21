import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './style.css'

import gsap from 'gsap'
import Lenis from 'lenis'
import { logos, media, slides } from './content'
import { slideDefs, type SceneKind } from './slides'
import { SceneManager, type SceneFactory } from './three/SceneManager'
import { moon } from './three/moon'
import { cards, cardsDark, type CardsModule } from './three/cards'
import { galaxy } from './three/galaxy'
import { slabs } from './three/slabs'
import { initPhones, pausePhones, syncVideos } from './ui/MediaSlot'
import { Timer } from './ui/Timer'
import { PresenterView } from './ui/PresenterView'
import { VideoLightbox } from './ui/VideoLightbox'

const N = slideDefs.length
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const pad = (n: number) => String(n).padStart(2, '0')
const unit = () => Math.min(innerWidth / 1920, innerHeight / 1080)

// cubic-bezier(.16,.84,.24,1) — curva de entrada del sistema.
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const f = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  return (x: number) => {
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (f(x1, x2, mid) < x) lo = mid
      else hi = mid
    }
    return f(y1, y2, (lo + hi) / 2)
  }
}
const ease = bezier(0.16, 0.84, 0.24, 1)

/* ───────────── DOM ───────────── */

const app = document.getElementById('app')!
app.innerHTML = `
  <div class="loader"><img src="${logos.plugin}" alt="" /><i class="loader-bar"></i></div>
  <div class="progress"></div>
  <div class="cursor is-hidden"><i class="cursor-play"></i></div>
  <nav class="nav" aria-label="Navegación">
    <button class="nav-btn nav-prev" type="button" aria-label="Sección anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
    <button class="nav-btn nav-next" type="button" aria-label="Sección siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
  </nav>
  <div class="scroller" style="height:${N * 100}vh"></div>
  ${slideDefs
    .map(
      (s, i) => `
    <section class="panel ${s.theme === 'light' ? 'is-light' : ''}" id="${s.id}" style="--bg:${s.bg};z-index:${i + 1}" aria-label="${pad(i + 1)} · ${slides[i].name}">
      <div class="panel-inner">
        ${s.bleed ? `<div class="bleed">${s.bleed}</div>` : ''}
        ${s.scene ? `<div class="scene-layer" data-scene="${s.scene}"></div>` : ''}
        <div class="stage">
          <span class="counter">${pad(i + 1)} / ${pad(N)}</span>
          ${s.stage}
        </div>
      </div>
      <div class="panel-dim"></div>
    </section>`,
    )
    .join('')}`

// Las capas de sombra van por encima de la escena 3D.
document.querySelectorAll<HTMLElement>('.panel').forEach((p) => {
  const shade = p.querySelector('.bleed .shade')
  const layer = p.querySelector('.scene-layer')
  if (shade && layer) layer.after(shade)
})

const panels = [...document.querySelectorAll<HTMLElement>('.panel')]
const inners = panels.map((p) => p.querySelector<HTMLElement>('.panel-inner')!)
const dims = panels.map((p) => p.querySelector<HTMLElement>('.panel-dim')!)
const progressBar = document.querySelector<HTMLElement>('.progress')!
const navPrev = document.querySelector<HTMLButtonElement>('.nav-prev')!
const navNext = document.querySelector<HTMLButtonElement>('.nav-next')!
const titles = panels.map((p) =>
  [...p.querySelectorAll('.title .line')].map((l) => l.textContent).join(' ').replace(/\s+/g, ' ').trim(),
)

/* ───────────── Escenas 3D ───────────── */

const factories: Record<SceneKind, SceneFactory> = {
  moon,
  'cards-dark': cards({ ...cardsDark, video: media['live-video'] || undefined }),
  galaxy,
  slabs,
}
const scenes = new SceneManager()
let liveWall: CardsModule | null = null
panels.forEach((p, i) => {
  const layer = p.querySelector<HTMLElement>('.scene-layer')
  if (!layer) return
  const mod = scenes.add(i, layer, factories[layer.dataset.scene as SceneKind])
  if (p.id === 's05') liveWall = mod as CardsModule
})

/* ───────────── Animaciones de entrada ───────────── */

const animEls = panels.map((p) => [...p.querySelectorAll<HTMLElement>('[data-a]')])
const played = panels.map(() => false)

function hideEntry(i: number) {
  played[i] = false
  if (reduced) return
  gsap.killTweensOf(animEls[i])
  gsap.set(animEls[i], { opacity: 0, y: 40 * unit(), filter: 'blur(10px)' })
  if (panels[i].id === 's12') {
    gsap.set(panels[i].querySelector('.steps-line i'), { scaleX: 0 })
    gsap.set(panels[i].querySelectorAll('.step'), { opacity: 0, y: 30 * unit() })
  }
}

function playEntry(i: number) {
  played[i] = true
  if (reduced) return
  gsap.to(animEls[i], { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease, stagger: 0.09, overwrite: true })
  if (panels[i].id === 's12') {
    const delay = animEls[i].length * 0.09 + 0.1
    gsap.to(panels[i].querySelector('.steps-line i'), { scaleX: 1, duration: 1.6, ease: 'power2.inOut', delay })
    gsap.to(panels[i].querySelectorAll('.step'), { opacity: 1, y: 0, duration: 0.9, ease, stagger: 0.3, delay })
  }
}
panels.forEach((_, i) => hideEntry(i))

/* ───────────── Scroll (cortinas apiladas) ───────────── */

const lenis = new Lenis({ lerp: reduced ? 1 : 0.09, wheelMultiplier: 0.85, smoothWheel: !reduced })
let vh = innerHeight
let ready = false
let active = -1
const visible = panels.map(() => false)

function go(i: number) {
  i = Math.max(0, Math.min(N - 1, i))
  // Saltos largos (volver al inicio) duran más para que se vean pasar las secciones.
  const duration = reduced ? 0 : Math.min(3, 1.25 + Math.max(0, Math.abs(i - active) - 1) * 0.15)
  lenis.scrollTo(i * vh, { duration, easing: (t) => 1 - Math.pow(1 - t, 4), lock: true })
}

function layout(s: number) {
  const u = unit()
  for (let i = 0; i < N; i++) {
    const p = s - i
    const show = p > -1 && (p < 1 || i === N - 1)
    if (show !== visible[i]) {
      visible[i] = show
      panels[i].style.visibility = show ? 'visible' : 'hidden'
      syncVideos(panels[i], show)
      if (!show) pausePhones(panels[i])
    }
    if (!show) continue
    if (p < 0) {
      // Entrando desde abajo: el contenido va algo más lento que la sección.
      const r = -p * 48 * u
      panels[i].style.transform = `translate3d(0,${-p * vh}px,0)`
      panels[i].style.borderRadius = `${r}px ${r}px 0 0`
      inners[i].style.transform = reduced ? '' : `translate3d(0,${p * vh * 0.3}px,0)`
      dims[i].style.opacity = '0'
    } else {
      // Tapada por la siguiente: se aleja y se oscurece.
      const e = i === N - 1 ? 0 : p
      panels[i].style.transform = 'none'
      panels[i].style.borderRadius = '0'
      inners[i].style.transform = reduced ? '' : `scale(${1 - e * 0.08})`
      inners[i].style.borderRadius = `${e * 40 * u}px`
      dims[i].style.opacity = String(e * 0.72)
    }
    if (ready) {
      if (!played[i] && p > -0.35) playEntry(i)
      else if (played[i] && p < -0.95) hideEntry(i)
    }
  }
  progressBar.style.transform = `scaleX(${N > 1 ? s / (N - 1) : 1})`

  const a = Math.max(0, Math.min(N - 1, Math.round(s)))
  if (a !== active) {
    active = a
    history.replaceState(null, '', `#${a + 1}`)
    navPrev.disabled = a === 0
    navNext.hidden = a === N - 1
    presenter.update(a)
  }
}

// Al soltar el scroll entre dos secciones, se asienta en la más cercana en la dirección del gesto.
let snapTimer = 0
lenis.on('scroll', () => {
  clearTimeout(snapTimer)
  snapTimer = window.setTimeout(() => {
    const s = lenis.scroll / vh
    const base = Math.floor(s)
    const frac = s - base
    if (lenis.isScrolling || frac < 0.002 || frac > 0.998) return
    go(lenis.direction >= 0 ? base + (frac > 0.15 ? 1 : 0) : base + (frac > 0.85 ? 1 : 0))
  }, 200)
})

gsap.ticker.lagSmoothing(0)
gsap.ticker.add((time, deltaMs) => {
  lenis.raf(time * 1000)
  const s = lenis.scroll / vh
  layout(s)
  scenes.tick(Math.min(deltaMs / 1000, 0.05), s)
})

addEventListener('resize', () => {
  const s = lenis.scroll / vh
  vh = innerHeight
  lenis.resize()
  lenis.scrollTo(s * vh, { immediate: true, force: true })
})

/* ───────────── Navegación ───────────── */

const timer = new Timer(document.getElementById('s13')!)
initPhones()

// 05: clic en cualquier parte (o V / Enter) abre el anuncio real desde su tarjeta del muro.
const liveVideo = media['live-video']
  ? new VideoLightbox(media['live-video'], {
      onOpen: () => {
        lenis.stop()
        document.body.classList.add('lb-open')
      },
      onClose: () => {
        lenis.start()
        document.body.classList.remove('lb-open')
      },
    })
  : null
const openLiveVideo = () => liveVideo?.open(() => liveWall?.heroRect() ?? null)
const onLiveSlide = () => panels[active]?.id === 's05' && !!liveVideo
const presenter = new PresenterView(titles, (e) => onKey(e))

function onKey(e: KeyboardEvent) {
  if (liveVideo?.isOpen) {
    if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault()
      liveVideo.close()
    } else if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      liveVideo.togglePlay()
    }
    return
  }
  const t = e.target as HTMLElement | null
  if (t?.isContentEditable) {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault()
      t.blur()
    }
    return
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      e.preventDefault()
      go(active + 1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
    case 'Backspace':
      e.preventDefault()
      go(active - 1)
      break
    case 'Home':
      e.preventDefault()
      go(0)
      break
    case 'End':
      e.preventDefault()
      go(N - 1)
      break
    case 'f':
    case 'F':
      if (document.fullscreenElement) document.exitFullscreen()
      else document.documentElement.requestFullscreen?.()
      break
    case 'v':
    case 'V':
    case 'Enter':
      if (onLiveSlide()) {
        e.preventDefault()
        openLiveVideo()
      }
      break
    case 'n':
    case 'N':
      presenter.open(active)
      break
    case 't':
    case 'T':
      if (panels[active].id === 's13') timer.toggle()
      break
    case 'r':
    case 'R':
      if (panels[active].id === 's13') timer.reset()
      break
  }
}
addEventListener('keydown', onKey)

navPrev.addEventListener('click', () => go(active - 1))
navNext.addEventListener('click', () => go(active + 1))
document.querySelector('.to-top')?.addEventListener('click', () => go(0))

// Clic / tap avanza, salvo sobre elementos interactivos o al seleccionar texto.
let downAt = { x: 0, y: 0 }
addEventListener('pointerdown', (e) => (downAt = { x: e.clientX, y: e.clientY }))
addEventListener('click', (e) => {
  const t = e.target as HTMLElement
  if (t.closest('[contenteditable], a, button, video[controls], .phone')) return
  if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return
  if (String(getSelection() ?? '').length) return
  if (liveVideo?.isOpen) return
  if (onLiveSlide() && t.closest('#s05')) return openLiveVideo()
  go(active + 1)
})

addEventListener('hashchange', () => {
  const n = parseInt(location.hash.slice(1), 10)
  if (n >= 1 && n <= N && n - 1 !== active) go(n - 1)
})

/* ───────────── Cursor ───────────── */

const cursor = document.querySelector<HTMLElement>('.cursor')!
const cur = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 }
let idleTimer = 0
addEventListener('pointermove', (e) => {
  cur.tx = e.clientX
  cur.ty = e.clientY
  cursor.classList.remove('is-hidden')
  const over = e.target as HTMLElement
  const play = onLiveSlide() && !liveVideo?.isOpen && !!over.closest('#s05')
  cursor.classList.toggle('is-play', play)
  cursor.classList.toggle('is-big', play || !!over.closest('.motive, .case-box, .brief-card, .flow-box, .media-slot, .phone'))
  document.body.classList.remove('is-idle')
  clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => document.body.classList.add('is-idle'), 2500)
})
gsap.ticker.add(() => {
  cur.x += (cur.tx - cur.x) * 0.22
  cur.y += (cur.ty - cur.y) * 0.22
  cursor.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`
})

/* ───────────── Arranque ───────────── */

const initial = Math.max(0, Math.min(N - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1))
lenis.scrollTo(initial * vh, { immediate: true, force: true })

addEventListener('beforeprint', () => panels.forEach((_, i) => playEntry(i)))

async function boot() {
  const loader = document.querySelector<HTMLElement>('.loader')!
  const bar = loader.querySelector('.loader-bar')!
  const logo = loader.querySelector('img')!
  if (reduced) {
    await document.fonts.ready
    loader.remove()
    ready = true
    return
  }
  gsap.to(logo, { opacity: 1, duration: 0.6, ease })
  await Promise.all([document.fonts.ready, gsap.to(bar, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' })])
  await gsap.to(loader, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: 0.1 })
  loader.remove()
  ready = true
}
boot()
