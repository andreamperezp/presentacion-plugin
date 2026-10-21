import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { viewSize, type SceneFactory } from './SceneManager'

export const slabs: SceneFactory = (renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 100)
  camera.position.set(0, 1.2, 13)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.35
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  scene.add(new THREE.HemisphereLight('#ffffff', '#1E0A3C', 0.35))
  const sun = new THREE.DirectionalLight('#ffffff', 2.2)
  sun.position.set(-4, 6, 5)
  scene.add(sun)
  const pMint = new THREE.PointLight('#3DEBB8', 40, 20)
  pMint.position.set(3.5, -1.5, 3)
  const pIndigo = new THREE.PointLight('#5D5FD3', 50, 20)
  pIndigo.position.set(-3, 2.5, 2)
  scene.add(pMint, pIndigo)

  const geo = new THREE.BoxGeometry(3.4, 0.42, 2.4)
  const edges = new THREE.EdgesGeometry(geo)
  const colors = ['#5D5FD3', '#F4F3EF', '#3DEBB8']
  const stack = new THREE.Group()
  const plates = colors.map((c, i) => {
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 }),
    )
    m.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25 })))
    m.userData.base = new THREE.Vector3((i - 1) * 0.55, (1 - i) * 0.95, (i - 1) * -0.35)
    m.rotation.y = (i - 1) * 0.22
    stack.add(m)
    return m
  })
  stack.rotation.set(0.38, -0.6, 0.08)
  const holder = new THREE.Group()
  holder.add(stack)
  holder.scale.setScalar(0.72)
  scene.add(holder)

  return {
    scene,
    camera,
    resize() {
      // A la derecha, dejando el lado izquierdo para el texto.
      const v = viewSize(camera, camera.position.z)
      holder.position.x = v.w * 0.27
      holder.position.y = 0.3
    },
    update({ t, mx, my, progress }) {
      plates.forEach((m, i) => {
        const b = m.userData.base as THREE.Vector3
        m.position.set(b.x, b.y + Math.sin(t * 0.9 + i * 1.3) * 0.12 - progress * (1 - i) * 0.8, b.z)
        m.rotation.y = (i - 1) * 0.22 + Math.sin(t * 0.4 + i) * 0.05
      })
      stack.rotation.y = -0.6 + t * 0.12
      camera.position.x = mx * 0.6
      camera.position.y = 1.2 - my * 0.4
      camera.lookAt(holder.position.x * 0.15, 0, 0)
    },
  }
}
