import gsap from 'gsap'

/**
 * Vídeo a pantalla completa que "sale" de un rectángulo de la pantalla
 * (la tarjeta del muro 3D) y vuelve a él al cerrarse.
 */
export class VideoLightbox {
  private root: HTMLElement
  private frame: HTMLElement
  private video: HTMLVideoElement
  private from: () => DOMRect | null = () => null
  isOpen = false

  constructor(
    src: string,
    private hooks: { onOpen?: () => void; onClose?: () => void } = {},
  ) {
    this.root = document.createElement('div')
    this.root.className = 'lightbox'
    this.root.hidden = true
    this.root.innerHTML = `
      <div class="lb-backdrop"></div>
      <div class="lb-frame"><video src="${src}" playsinline preload="metadata"></video></div>
      <button class="lb-close" type="button" aria-label="Cerrar vídeo"><span></span><span></span></button>`
    document.body.append(this.root)
    this.frame = this.root.querySelector('.lb-frame')!
    this.video = this.root.querySelector('video')!
    this.root.addEventListener('click', (e) => {
      e.stopPropagation()
      if ((e.target as HTMLElement).closest('.lb-frame')) this.togglePlay()
      else this.close()
    })
    this.video.addEventListener('ended', () => this.close())
  }

  /** Rectángulo final: 9:16 centrado, lo más grande posible con margen. */
  private target() {
    const h = Math.min(innerHeight * 0.9, ((innerWidth * 0.9) * 16) / 9)
    const w = (h * 9) / 16
    return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h }
  }

  /** `from` devuelve el rectángulo de origen; se vuelve a leer al cerrar porque la tarjeta flota. */
  open(from: () => DOMRect | null) {
    if (this.isOpen) return
    this.isOpen = true
    this.from = from
    this.root.hidden = false
    this.hooks.onOpen?.()
    const end = this.target()
    const start = from() ?? new DOMRect(end.left + end.width * 0.3, end.top + end.height * 0.3, end.width * 0.4, end.height * 0.4)
    this.video.currentTime = 0
    this.video.muted = false
    this.video.play().catch(() => {
      // Sin gesto del usuario el navegador puede bloquear el sonido: se reproduce en silencio.
      this.video.muted = true
      this.video.play().catch(() => {})
    })
    gsap.killTweensOf([this.frame, this.root.querySelector('.lb-backdrop'), this.root.querySelector('.lb-close')])
    gsap.fromTo(this.root.querySelector('.lb-backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.5 })
    gsap.fromTo(
      this.frame,
      { left: start.left, top: start.top, width: start.width, height: start.height, borderRadius: 10 },
      { ...end, borderRadius: 24, duration: 0.9, ease: 'expo.out' },
    )
    gsap.fromTo(this.root.querySelector('.lb-close'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.35 })
  }

  close() {
    if (!this.isOpen) return
    this.isOpen = false
    this.video.pause()
    const back = this.from()
    gsap.to(this.root.querySelector('.lb-close'), { opacity: 0, duration: 0.2 })
    gsap.to(this.root.querySelector('.lb-backdrop'), { opacity: 0, duration: 0.5, delay: 0.1 })
    gsap.to(this.frame, {
      ...(back
        ? { left: back.left, top: back.top, width: back.width, height: back.height, borderRadius: 10 }
        : { opacity: 0, scale: 0.9 }),
      duration: 0.7,
      ease: 'expo.inOut',
      onComplete: () => {
        this.root.hidden = true
        gsap.set(this.frame, { opacity: 1, scale: 1 })
        this.hooks.onClose?.()
      },
    })
  }

  togglePlay() {
    if (this.video.paused) this.video.play().catch(() => {})
    else this.video.pause()
  }
}
