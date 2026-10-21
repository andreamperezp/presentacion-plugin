import { slides } from '../content'

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}`
const TOTAL = slides.reduce((t, s) => t + s.minutes, 0)
/** Minuto de la escaleta en el que empieza cada sección. */
const START = slides.map((_, i) => slides.slice(0, i).reduce((t, s) => t + s.minutes, 0))

/** Ventana de notas del ponente (tecla N), sincronizada con la sección activa. */
export class PresenterView {
  private win: Window | null = null
  private startedAt = 0
  private slideAt = Date.now()
  private index = -1

  constructor(
    private titles: string[],
    private onKey: (e: KeyboardEvent) => void,
  ) {
    setInterval(() => this.clock(), 500)
  }

  open(index: number) {
    if (this.win && !this.win.closed) {
      this.win.focus()
      return
    }
    this.win = window.open('', 'plugin-notas', 'width=1180,height=760')
    if (!this.win) return
    // El reloj total arranca la primera vez que se abren las notas.
    if (!this.startedAt) this.startedAt = Date.now()
    const d = this.win.document
    d.title = 'Notas · Plugin Creativo × Screamfield'
    d.body.innerHTML = `
      <style>
        body{margin:0;background:#0A0910;color:#F4F3EF;font:400 20px/1.45 system-ui,sans-serif;display:grid;grid-template-columns:1.25fr 1fr;grid-template-rows:auto 1fr;gap:24px;padding:28px;height:100vh;box-sizing:border-box}
        .mono{font-family:'JetBrains Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;font-size:14px;color:#8C8798}
        header{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:24px}
        .total{display:flex;align-items:baseline;gap:12px}
        .clock{font:600 40px/1 'JetBrains Mono',monospace;color:#F4F3EF;font-variant-numeric:tabular-nums}
        .card{background:#15131C;border:1px solid #2A2633;border-radius:16px;padding:24px;overflow:auto}
        .who{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:8px 0 14px}
        .speaker{font:900 44px/1 system-ui;letter-spacing:-.01em}
        .speaker.eduardo,.nspk.eduardo{color:#3DEBB8} .speaker.mike,.nspk.mike{color:#A3A5F0} .speaker.both,.nspk.both{color:#FF5A1F}
        .slot{font:600 30px/1 'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;text-align:right}
        .slot small{font-size:16px;color:#8C8798}
        .slot.over{color:#FF5A1F}
        .bar{height:8px;border-radius:99px;background:#2A2633;overflow:hidden;margin-bottom:18px}
        .bar i{display:block;height:100%;width:0;background:#3DEBB8;transition:width .4s}
        .bar.over i{background:#FF5A1F}
        .now h1{font:900 30px/1.05 system-ui;margin:0 0 14px;text-transform:uppercase}
        .plan{margin:0 0 16px}
        .next{opacity:.75} .next h2{font:800 22px/1.15 system-ui;margin:8px 0;text-transform:uppercase}
        .nspk{font:900 26px/1 system-ui;margin-top:14px}
        .notes{white-space:pre-line;font-size:21px;color:#CFCBD6;border-top:1px solid #2A2633;padding-top:16px}
        .keys{margin-top:24px;line-height:1.8}
        button{font:600 13px/1 'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:#CFCBD6;background:none;border:1px solid #2A2633;border-radius:99px;padding:10px 14px;cursor:pointer}
        button:hover{border-color:#8C8798}
      </style>
      <header>
        <span class="mono" id="pos"></span>
        <span class="total"><span class="clock" id="clock">00:00</span><span class="mono">/ ${mmss(TOTAL * 60)}</span><button id="reset" type="button">Reiniciar reloj</button></span>
      </header>
      <section class="card now">
        <div class="who"><span class="speaker" id="spk"></span><span class="slot" id="slot"></span></div>
        <div class="bar" id="bar"><i></i></div>
        <h1 id="cur"></h1>
        <p class="mono plan" id="plan"></p>
        <div class="notes" id="notes"></div>
      </section>
      <section class="card next">
        <span class="mono">Siguiente</span>
        <div class="nspk" id="nspk"></div>
        <h2 id="nxt"></h2>
        <p class="mono keys">← → navegar · V vídeo (05) · T temporizador (11) · R reiniciar · F pantalla completa</p>
      </section>`
    this.win.addEventListener('keydown', (e) => this.onKey(e))
    d.getElementById('reset')!.addEventListener('click', () => {
      this.startedAt = this.slideAt = Date.now()
      this.clock()
    })
    this.index = -1
    this.update(index)
  }

  update(index: number) {
    if (index !== this.index) {
      this.index = index
      this.slideAt = Date.now()
    }
    if (!this.win || this.win.closed) return
    const d = this.win.document
    const n = slides.length
    const s = slides[index]
    const set = (id: string, v: string) => {
      const el = d.getElementById(id)
      if (el) el.textContent = v
    }
    const cls = (who: string) => (who.includes('→') ? 'both' : who.toLowerCase())
    set('pos', `${String(index + 1).padStart(2, '0')} / ${n} · ${s.name}`)
    set('spk', s.speaker)
    d.getElementById('spk')!.className = `speaker ${cls(s.speaker)}`
    set('cur', this.titles[index])
    set('notes', s.notes)
    set('plan', `Escaleta: esta sección va del min ${START[index]} al ${START[index] + s.minutes}`)
    const next = slides[index + 1]
    set('nspk', next ? `${next.speaker} · ${next.minutes} min` : '')
    d.getElementById('nspk')!.className = `nspk ${next ? cls(next.speaker) : ''}`
    set('nxt', next ? `${String(index + 2).padStart(2, '0')} · ${next.name} — ${this.titles[index + 1]}` : '— Fin —')
    this.clock()
  }

  private clock() {
    if (!this.win || this.win.closed || this.index < 0) return
    const d = this.win.document
    const total = (Date.now() - this.startedAt) / 1000
    const inSlide = (Date.now() - this.slideAt) / 1000
    const plan = slides[this.index].minutes * 60
    const over = inSlide > plan
    const clock = d.getElementById('clock')
    if (clock) clock.textContent = mmss(total)
    const slot = d.getElementById('slot')
    if (slot) {
      slot.innerHTML = `${mmss(inSlide)} <small>/ ${mmss(plan)}</small>`
      slot.classList.toggle('over', over)
    }
    const bar = d.getElementById('bar')
    if (bar) {
      bar.classList.toggle('over', over)
      ;(bar.firstElementChild as HTMLElement).style.width = `${Math.min(100, (inSlide / plan) * 100)}%`
    }
  }
}
