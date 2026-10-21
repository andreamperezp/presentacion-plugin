import { slides } from '../content'

/** Ventana de notas del ponente (tecla N), sincronizada con la sección activa. */
export class PresenterView {
  private win: Window | null = null
  private startedAt = Date.now()

  constructor(
    private titles: string[],
    private onKey: (e: KeyboardEvent) => void,
  ) {
    setInterval(() => this.clock(), 1000)
  }

  open(index: number) {
    if (this.win && !this.win.closed) {
      this.win.focus()
      return
    }
    this.win = window.open('', 'plugin-notas', 'width=1100,height=720')
    if (!this.win) return
    const d = this.win.document
    d.title = 'Notas · Plugin Creativo × Screamfield'
    d.body.innerHTML = `
      <style>
        body{margin:0;background:#0A0910;color:#F4F3EF;font:400 20px/1.45 'Archivo Variable',system-ui,sans-serif;display:grid;grid-template-columns:1.2fr 1fr;grid-template-rows:auto 1fr;gap:28px;padding:32px;height:100vh;box-sizing:border-box}
        .mono{font-family:'JetBrains Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;font-size:14px;color:#8C8798}
        header{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline}
        .clock{font:600 40px/1 'JetBrains Mono',monospace;color:#3DEBB8}
        .card{background:#15131C;border:1px solid #2A2633;border-radius:16px;padding:24px;overflow:auto}
        .now h1{font:900 34px/1.05 system-ui;margin:10px 0 18px;text-transform:uppercase}
        .next{opacity:.7} .next h2{font:800 24px/1.1 system-ui;margin:10px 0;text-transform:uppercase}
        .notes{white-space:pre-line;font-size:22px;color:#CFCBD6;border-top:1px solid #2A2633;padding-top:16px;margin-top:16px}
        .keys{margin-top:24px}
      </style>
      <header><span class="mono" id="pos"></span><span class="clock" id="clock">00:00</span></header>
      <section class="card now"><span class="mono">Ahora</span><h1 id="cur"></h1><div class="notes" id="notes"></div></section>
      <section class="card next"><span class="mono">Siguiente</span><h2 id="nxt"></h2><p class="mono keys">← → navegar · T temporizador (13) · R reiniciar · F pantalla completa</p></section>`
    this.win.addEventListener('keydown', (e) => this.onKey(e))
    this.update(index)
  }

  update(index: number) {
    if (!this.win || this.win.closed) return
    const d = this.win.document
    const n = slides.length
    const set = (id: string, v: string) => {
      const el = d.getElementById(id)
      if (el) el.textContent = v
    }
    set('pos', `${String(index + 1).padStart(2, '0')} / ${n} · ${slides[index].name}`)
    set('cur', this.titles[index])
    set('notes', slides[index].notes)
    set('nxt', index + 1 < n ? `${String(index + 2).padStart(2, '0')} · ${slides[index + 1].name} — ${this.titles[index + 1]}` : '— Fin —')
  }

  private clock() {
    if (!this.win || this.win.closed) return
    const s = Math.floor((Date.now() - this.startedAt) / 1000)
    const el = this.win.document.getElementById('clock')
    if (el) el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }
}
