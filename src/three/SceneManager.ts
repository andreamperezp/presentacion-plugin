import * as THREE from 'three'

export interface FrameState {
  /** Tiempo en segundos (congelado con prefers-reduced-motion). */
  t: number
  dt: number
  /** Ratón suavizado, -1…1. */
  mx: number
  my: number
  /** Posición de scroll relativa a la sección: -1 entrando, 0 activa, 1 tapada. */
  progress: number
}

export interface SceneModule {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  resize?(w: number, h: number): void
  update(f: FrameState): void
  /** Se llama al entrar o salir de pantalla (p. ej. para pausar vídeos). */
  setActive?(active: boolean): void
}

export type SceneFactory = (renderer: THREE.WebGLRenderer) => SceneModule

interface Entry {
  index: number
  renderer: THREE.WebGLRenderer
  mod: SceneModule
  host: HTMLElement
  snapshot: HTMLImageElement
  w: number
  h: number
  active: boolean
}

const MAX_DPR = 1.5

/** Un renderer por escena; solo se renderizan las escenas de secciones visibles. */
export class SceneManager {
  private entries: Entry[] = []
  private mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  private time = 0

  constructor() {
    addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / innerWidth) * 2 - 1
      this.mouse.y = (e.clientY / innerHeight) * 2 - 1
    })
    const ro = new ResizeObserver(() => this.entries.forEach((e) => this.resize(e)))
    ro.observe(document.documentElement)
    addEventListener('beforeprint', () => this.snapshotAll())
  }

  add(index: number, host: HTMLElement, factory: SceneFactory) {
    const canvas = document.createElement('canvas')
    const snapshot = document.createElement('img')
    snapshot.alt = ''
    host.append(canvas, snapshot)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_DPR))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const entry: Entry = { index, renderer, mod: factory(renderer), host, snapshot, w: 0, h: 0, active: false }
    this.entries.push(entry)
    this.resize(entry)
    return entry.mod
  }

  private resize(e: Entry) {
    const w = e.host.clientWidth || innerWidth
    const h = e.host.clientHeight || innerHeight
    if (w === e.w && h === e.h) return
    e.w = w
    e.h = h
    e.renderer.setSize(w, h, false)
    e.mod.camera.aspect = w / h
    e.mod.camera.updateProjectionMatrix()
    e.mod.resize?.(w, h)
  }

  /** `progressOf(i)`: posición de la sección i (-1 entrando, 0 activa, 1 tapada) o null si no se ve. */
  tick(dt: number, progressOf: (index: number) => number | null) {
    if (!this.reduced) this.time += dt
    const k = this.reduced ? 0 : 1 - Math.pow(0.001, dt)
    this.mouse.sx += (this.mouse.x - this.mouse.sx) * k
    this.mouse.sy += (this.mouse.y - this.mouse.sy) * k
    for (const e of this.entries) {
      const progress = progressOf(e.index)
      const active = progress !== null
      if (active !== e.active) e.mod.setActive?.(active)
      e.active = active
      if (progress === null) continue
      this.renderEntry(e, dt, progress)
    }
  }

  private renderEntry(e: Entry, dt: number, progress: number) {
    e.mod.update({ t: this.time, dt, mx: this.mouse.sx, my: this.mouse.sy, progress })
    e.renderer.render(e.mod.scene, e.mod.camera)
  }

  /** Para impresión: un fotograma estático por escena. */
  private snapshotAll() {
    for (const e of this.entries) {
      this.renderEntry(e, 0, 0)
      try {
        e.snapshot.src = e.renderer.domElement.toDataURL('image/png')
      } catch {
        /* sin snapshot: se imprime el fondo de la sección */
      }
    }
  }
}

/** Textura radial suave para halos y sprites. */
export function glowTexture(inner: string, outer = 'rgba(0,0,0,0)', size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, inner)
  grd.addColorStop(1, outer)
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Ancho/alto visibles a una distancia dada para una cámara en perspectiva. */
export function viewSize(camera: THREE.PerspectiveCamera, distance: number) {
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance
  return { w: h * camera.aspect, h }
}
