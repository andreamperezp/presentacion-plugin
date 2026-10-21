import { media, posters, type MediaKey } from '../content'

const isVideo = (src: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(src)

/**
 * Hueco de imagen/vídeo. Lee la ruta de content.ts; si está vacía muestra un
 * placeholder rayado con el nombre del hueco en mono.
 */
export function mediaSlot(key: MediaKey, className = '', hint = ''): string {
  const src = media[key]
  const cls = `media-slot ${className}`.trim()
  if (!src) {
    return `<div class="${cls} is-empty" data-slot="${key}"><span class="slot-hint">${key.toUpperCase()}${
      hint ? ` · ${hint}` : ''
    }</span></div>`
  }
  const inner = isVideo(src)
    ? `<video src="${src}" muted loop playsinline preload="auto" data-autoplay></video>`
    : `<img src="${src}" alt="" decoding="async" />`
  return `<div class="${cls}" data-slot="${key}">${inner}</div>`
}

/** Reproduce los vídeos solo cuando su sección es visible. */
export function syncVideos(section: HTMLElement, visible: boolean) {
  section.querySelectorAll<HTMLVideoElement>('video[data-autoplay]').forEach((v) => {
    if (visible && v.paused) v.play().catch(() => {})
    else if (!visible && !v.paused) v.pause()
  })
}

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>'

/**
 * Teléfono con un anuncio 9:16. El vídeo no arranca solo: se reproduce con sonido
 * al pulsar play y se pausa al volver a pulsar. Sin archivo muestra el placeholder.
 */
export function phoneSlot(key: MediaKey, className = ''): string {
  const src = media[key]
  const screen = !src
    ? `<div class="media-slot is-empty"><span class="slot-hint">${key.replace('-', ' ').toUpperCase()} · 9:16</span></div>`
    : isVideo(src)
      ? `<video src="${posters[key] ? src : `${src}#t=0.1`}"${posters[key] ? ` poster="${posters[key]}"` : ''} playsinline preload="metadata"></video>
         <button class="phone-play" type="button" aria-label="Reproducir anuncio">${PLAY}</button>`
      : `<img src="${src}" alt="" decoding="async" />`
  return `<div class="phone ${className}" data-slot="${key}"><div class="phone-screen">${screen}<i class="phone-island"></i></div></div>`
}

/** Conecta los botones de play. Solo suena un teléfono a la vez. */
export function initPhones(root: ParentNode = document) {
  const phones = [...root.querySelectorAll<HTMLElement>('.phone')].filter((p) => p.querySelector('video'))
  const videos = phones.map((p) => p.querySelector('video')!)
  phones.forEach((phone, i) => {
    const video = videos[i]
    const sync = () => phone.classList.toggle('is-playing', !video.paused)
    phone.querySelector('.phone-screen')!.addEventListener('click', () => {
      if (video.paused) {
        videos.forEach((v) => v !== video && v.pause())
        if (video.ended) video.currentTime = 0
        video.play().catch(() => {})
      } else video.pause()
    })
    video.addEventListener('play', sync)
    video.addEventListener('pause', sync)
    video.addEventListener('ended', sync)
  })
}

/** Pausa los teléfonos de una sección que sale de pantalla. */
export function pausePhones(section: HTMLElement) {
  section.querySelectorAll<HTMLVideoElement>('.phone video').forEach((v) => v.pause())
}
