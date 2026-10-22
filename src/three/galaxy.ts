import * as THREE from 'three'
import { glowTexture, type SceneFactory } from './SceneManager'

const vert = /* glsl */ `
  uniform float uPR; uniform float uSize;
  attribute float aScale;
  varying vec3 vColor;
  void main(){
    vec4 mv = modelViewMatrix*vec4(position,1.);
    gl_PointSize = uSize*aScale*uPR*(1./-mv.z);
    gl_Position = projectionMatrix*mv;
    vColor = color;
  }
`
const frag = /* glsl */ `
  varying vec3 vColor;
  void main(){
    float d = length(gl_PointCoord-.5);
    float a = pow(1.-smoothstep(0.,.5,d), 3.);
    gl_FragColor = vec4(vColor*a, a);
  }
`

function points(count: number, fill: (i: number, p: Float32Array, c: Float32Array, s: Float32Array) => void, size: number, pr: number) {
  const p = new Float32Array(count * 3)
  const c = new Float32Array(count * 3)
  const s = new Float32Array(count)
  for (let i = 0; i < count; i++) fill(i, p, c, s)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3))
  geo.setAttribute('aScale', new THREE.BufferAttribute(s, 1))
  const uniforms = { uPR: { value: pr }, uSize: { value: size } }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return { obj: new THREE.Points(geo, mat), uniforms }
}

export const galaxy: SceneFactory = (renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 200)
  camera.position.set(0, 0, 9)
  const pr = renderer.getPixelRatio()

  const COUNT = 26000
  const ARMS = 3
  const R = 6
  const white = new THREE.Color('#ffffff')
  const indigo = new THREE.Color('#5D5FD3')
  const mint = new THREE.Color('#3DEBB8')
  const tmp = new THREE.Color()

  const disc = points(
    COUNT,
    (i, p, c, s) => {
      const r = Math.pow(Math.random(), 1.6) * R
      const branch = ((i % ARMS) / ARMS) * Math.PI * 2
      const spin = r * 0.95
      const rnd = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (0.25 + r * 0.16)
      p[i * 3] = Math.cos(branch + spin) * r + rnd()
      p[i * 3 + 1] = rnd() * 0.45
      p[i * 3 + 2] = Math.sin(branch + spin) * r + rnd()
      const f = r / R
      if (f < 0.45) tmp.copy(white).lerp(indigo, f / 0.45)
      else tmp.copy(indigo).lerp(mint, (f - 0.45) / 0.55)
      c[i * 3] = tmp.r
      c[i * 3 + 1] = tmp.g
      c[i * 3 + 2] = tmp.b
      s[i] = (0.4 + Math.random() * 1.1) * (0.35 + 0.65 * Math.min(1, f * 2.5))
    },
    46,
    pr,
  )

  const stars = points(
    2200,
    (i, p, c, s) => {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 40)
      p.set([v.x, v.y, v.z], i * 3)
      const b = 0.35 + Math.random() * 0.5
      c.set([b, b, b * 1.1], i * 3)
      s[i] = 0.5 + Math.random()
    },
    120,
    pr,
  )
  scene.add(stars.obj)

  const g = new THREE.Group()
  g.rotation.x = THREE.MathUtils.degToRad(62)
  g.rotation.z = THREE.MathUtils.degToRad(-14)
  g.add(disc.obj)
  const core = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture('rgba(220,222,255,0.55)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
  )
  core.scale.setScalar(2.4)
  const coreHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture('rgba(93,95,211,0.35)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
  )
  coreHalo.scale.setScalar(9)
  const holder = new THREE.Group()
  holder.add(g, coreHalo, core)
  scene.add(holder)

  return {
    scene,
    camera,
    resize(w, h) {
      holder.position.set(3 * Math.min(1.3, w / h / (16 / 9)), w < h ? 2.2 : 0.6, 0)
      disc.uniforms.uPR.value = stars.uniforms.uPR.value = renderer.getPixelRatio()
    },
    update({ t, mx, my, progress }) {
      disc.obj.rotation.y = -t * 0.05 - progress * 0.6
      stars.obj.rotation.y = t * 0.004
      camera.position.x = mx * 0.6
      camera.position.y = -my * 0.4
      camera.position.z = 9 - progress * 2.5
      camera.lookAt(0, 0, 0)
    },
  }
}
