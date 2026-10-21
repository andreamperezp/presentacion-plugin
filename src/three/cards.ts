import * as THREE from 'three'
import type { SceneFactory } from './SceneManager'

interface CardsOptions {
  bg: string
  palette: string[]
  flash: string
  /** Luminancia de los elementos del anuncio sobre el color base (0–1). */
  detail: number
}

export const cardsDark: CardsOptions = {
  bg: '#0A0910',
  palette: ['#3a0d0c', '#5a1510', '#24151a', '#7a1f12', '#16101a', '#46120f', '#2c0b14'],
  flash: '#FF5A1F',
  detail: 0.55,
}

export const cardsLight: CardsOptions = {
  bg: '#F4F3EF',
  palette: ['#5D5FD3', '#1E0A3C', '#3DEBB8', '#8B8DE6', '#2D1559', '#B9BAF0', '#4A3C8C'],
  flash: '#3DEBB8',
  detail: 0.85,
}

const COLS = 15
const ROWS = 8
const RADIUS = 9
const CARD_W = 1.15
const CARD_H = (CARD_W * 16) / 9

/** Textura de "anuncio" en escala de grises: se multiplica por el color de cada instancia. */
function adTexture(detail: number) {
  const W = 256
  const H = 456
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const shade = (v: number) => {
    const n = Math.round(255 * v)
    return `rgb(${n},${n},${n})`
  }
  g.fillStyle = shade(0.62)
  g.beginPath()
  g.roundRect(0, 0, W, H, 22)
  g.fill()
  // Zona de "vídeo"
  const grd = g.createLinearGradient(0, 40, 0, 300)
  grd.addColorStop(0, shade(0.78))
  grd.addColorStop(1, shade(0.5))
  g.fillStyle = grd
  g.beginPath()
  g.roundRect(14, 64, W - 28, 250, 14)
  g.fill()
  // Cabecera: avatar + nombre
  g.fillStyle = shade(detail + 0.3)
  g.beginPath()
  g.arc(34, 34, 16, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = shade(detail + 0.2)
  g.beginPath()
  g.roundRect(60, 24, 110, 10, 5)
  g.roundRect(60, 40, 70, 8, 4)
  g.fill()
  // Play
  g.fillStyle = shade(1)
  g.beginPath()
  g.moveTo(112, 162)
  g.lineTo(150, 189)
  g.lineTo(112, 216)
  g.fill()
  // Barras de texto
  g.fillStyle = shade(detail + 0.25)
  g.beginPath()
  g.roundRect(16, 332, 200, 12, 6)
  g.roundRect(16, 352, 160, 12, 6)
  g.roundRect(16, 372, 120, 12, 6)
  g.fill()
  // Botón
  g.fillStyle = shade(1)
  g.beginPath()
  g.roundRect(16, 404, W - 32, 36, 18)
  g.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export const cards =
  (opts: CardsOptions): SceneFactory =>
  () => {
    const scene = new THREE.Scene()
    const bg = new THREE.Color(opts.bg)
    scene.background = bg
    scene.fog = new THREE.Fog(bg, 9, 24)

    const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 100)
    camera.position.set(0, 0, 6.5)

    const group = new THREE.Group()
    scene.add(group)

    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H)
    const mat = new THREE.MeshBasicMaterial({ map: adTexture(opts.detail), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })
    const mesh = new THREE.InstancedMesh(geo, mat, COLS * ROWS)
    group.add(mesh)

    const palette = opts.palette.map((c) => new THREE.Color(c))
    const flash = new THREE.Color(opts.flash)
    const base: THREE.Color[] = []
    const current: THREE.Color[] = []
    const phase: number[] = []
    const angleStep = (CARD_W + 0.28) / RADIUS
    const rowStep = CARD_H + 0.3
    const dummy = new THREE.Object3D()
    const layout: { a: number; y: number }[] = []

    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        const i = r * COLS + col
        // Columnas alternas desplazadas en vertical, como un muro editorial.
        layout.push({ a: (col - (COLS - 1) / 2) * angleStep, y: (r - (ROWS - 1) / 2) * rowStep + (col % 2 ? rowStep * 0.35 : 0) })
        const b = palette[Math.floor(Math.random() * palette.length)].clone()
        base.push(b)
        current.push(b.clone())
        phase.push(Math.random() * Math.PI * 2)
        mesh.setColorAt(i, b)
      }
    }

    let flashClock = 0

    return {
      scene,
      camera,
      resize(w, h) {
        // Muro a la derecha: el texto vive a la izquierda.
        group.position.x = 4.6 * Math.min(1.25, w / h / (16 / 9))
      },
      update({ t, dt, mx, my, progress }) {
        flashClock += dt
        while (flashClock > 0.12) {
          flashClock -= 0.12
          const i = Math.floor(Math.random() * current.length)
          current[i].copy(flash)
        }
        const k = 1 - Math.pow(0.45, dt) // vuelta lenta al color base
        for (let i = 0; i < layout.length; i++) {
          const { a, y } = layout[i]
          const float = Math.sin(t * 0.8 + phase[i]) * 0.07
          dummy.position.set(Math.sin(a) * RADIUS, y + float, RADIUS - Math.cos(a) * RADIUS - 9)
          dummy.rotation.set(0, -a, Math.sin(t * 0.5 + phase[i]) * 0.012)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
          current[i].lerp(base[i], k)
          mesh.setColorAt(i, current[i])
        }
        mesh.instanceMatrix.needsUpdate = true
        mesh.instanceColor!.needsUpdate = true

        group.rotation.y = Math.sin(t * 0.12) * 0.07 - 0.18 + progress * 0.25
        group.rotation.x = Math.sin(t * 0.09) * 0.025
        group.position.y = -progress * 2.2
        camera.position.x = mx * 0.5
        camera.position.y = -my * 0.35
        camera.lookAt(0, 0, -6)
      },
    }
  }
