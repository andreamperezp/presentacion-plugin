import { copy } from '../content'

/**
 * Temporizador del Creative challenge (13): T inicia / pausa, R reinicia.
 * Recorre los tramos (5, 5 y 2 min), rellena la barra activa y muestra la cuenta atrás.
 */
export class Timer {
  private phases = copy.s13.phases.map((p) => p.minutes * 60)
  private phase = 0
  private elapsed = 0
  private running = false
  private started = false
  private last = 0
  private els: HTMLElement[]
  private fills: HTMLElement[]
  private display: HTMLElement

  constructor(root: HTMLElement) {
    this.els = [...root.querySelectorAll<HTMLElement>('.phase')]
    this.fills = this.els.map((e) => e.querySelector('i')!)
    this.display = root.querySelector('.countdown')!
    requestAnimationFrame(this.loop)
  }

  toggle() {
    if (this.phase >= this.phases.length) this.reset()
    this.running = !this.running
    this.started = true
    this.last = performance.now()
    this.render()
  }

  reset() {
    this.phase = 0
    this.elapsed = 0
    this.running = false
    this.started = false
    this.render()
  }

  private loop = (now: number) => {
    if (this.running) {
      this.elapsed += (now - this.last) / 1000
      if (this.elapsed >= this.phases[this.phase]) {
        this.elapsed = 0
        this.phase++
        if (this.phase >= this.phases.length) this.running = false
      }
      this.render()
    }
    this.last = now
    requestAnimationFrame(this.loop)
  }

  private render() {
    const done = this.phase >= this.phases.length
    this.els.forEach((el, i) => {
      el.classList.toggle('is-active', this.started && i === this.phase)
      el.classList.toggle('is-done', i < this.phase)
      const p = i === this.phase ? this.elapsed / this.phases[i] : i < this.phase ? 1 : 0
      this.fills[i].style.transform = `scaleX(${p})`
    })
    const left = done ? 0 : Math.ceil(this.phases[this.phase] - this.elapsed)
    this.display.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
    this.display.classList.toggle('is-on', this.started)
    this.display.classList.toggle('is-paused', this.started && !this.running && !done)
  }
}
