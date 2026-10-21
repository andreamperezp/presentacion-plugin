import { media, type MediaKey } from '../content'

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
