import * as THREE from 'three'
import { glowTexture, viewSize, type SceneFactory } from './SceneManager'

const noise3 = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<5;i++){f+=a*snoise(p);p*=2.03;a*=.5;}return f;}
`

const moonVert = /* glsl */ `
  varying vec3 vObj; varying vec3 vNormal; varying vec3 vView;
  void main(){
    vObj = position;
    vec4 mv = modelViewMatrix * vec4(position,1.);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const moonFrag = /* glsl */ `
  uniform float uTime;
  varying vec3 vObj; varying vec3 vNormal; varying vec3 vView;
  ${noise3}
  // Cráteres: celdas de Worley oscurecidas con un borde ligeramente más claro.
  vec3 hash3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return fract(sin(p)*43758.5453);}
  float craters(vec3 p){
    vec3 i=floor(p); vec3 f=fract(p); float c=0.;
    for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){
      vec3 g=vec3(x,y,z); vec3 h=hash3(i+g);
      if(h.z<.55) continue;
      float r=.18+.28*h.x; float d=length(g+h-f);
      c+= -smoothstep(r,r*.55,d)*.9 + smoothstep(r*1.25,r,d)*smoothstep(r*.85,r,d)*.5;
    }
    return c;
  }
  void main(){
    vec3 p = vObj*1.6;
    float n = fbm(p*1.3 + vec3(0.,0.,uTime*.02));
    float n2 = fbm(p*4.2);
    float cr = craters(vObj*3.2) + craters(vObj*6.5)*.5;
    vec3 deep = vec3(.16,.02,.01);
    vec3 red  = vec3(.55,.07,.03);
    vec3 ember= vec3(1.,.36,.12);
    float m = smoothstep(-.55,.75,n + n2*.35);
    vec3 col = mix(deep, red, m);
    col = mix(col, ember, smoothstep(.35,.95,n2*.5+n*.6)*.55);
    col *= 1. + cr*.55;
    vec3 L = normalize(vec3(-.75,.85,.55));
    float diff = clamp(dot(vNormal,L),0.,1.);
    col *= .12 + 1.15*pow(diff,.85);
    float fres = pow(1.-max(dot(vNormal,vView),0.),2.6);
    col += vec3(1.,.33,.08)*fres*1.6;
    col += vec3(1.,.55,.2)*pow(fres,6.)*1.2;
    gl_FragColor = vec4(col,1.);
    #include <colorspace_fragment>
  }
`

const emberVert = /* glsl */ `
  uniform float uTime; uniform float uH; uniform float uPR;
  attribute vec4 aSeed;
  varying float vA;
  void main(){
    vec3 p = position;
    float speed = .25 + aSeed.x*.55;
    float y = mod(p.y + uTime*speed, uH);
    p.y = y - uH*.5;
    p.x += sin(uTime*(.6+aSeed.y) + aSeed.z*6.28)*(.15+aSeed.w*.35);
    p.z += cos(uTime*(.4+aSeed.y*.5) + aSeed.w*6.28)*.2;
    float life = y/uH;
    vA = smoothstep(0.,.12,life)*(1.-smoothstep(.65,1.,life))*(.45+aSeed.x*.55);
    vec4 mv = modelViewMatrix*vec4(p,1.);
    gl_PointSize = (2.+aSeed.w*5.)*uPR*(10./-mv.z);
    gl_Position = projectionMatrix*mv;
  }
`

const emberFrag = /* glsl */ `
  varying float vA;
  void main(){
    float d = length(gl_PointCoord-.5);
    float a = smoothstep(.5,0.,d);
    gl_FragColor = vec4(vec3(1.,.42,.14)*(1.+a), a*a*vA);
  }
`

export const moon: SceneFactory = (renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 100)
  camera.position.set(0, 0, 12)

  const group = new THREE.Group()
  scene.add(group)

  const moonUniforms = { uTime: { value: 0 } }
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 128, 96),
    new THREE.ShaderMaterial({ uniforms: moonUniforms, vertexShader: moonVert, fragmentShader: moonFrag }),
  )
  group.add(sphere)

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture('rgba(255,90,31,0.55)'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  )
  halo.scale.setScalar(9)
  halo.position.z = -0.5
  group.add(halo)

  // Brasas: el movimiento y el reciclado se resuelven en el vertex shader.
  const COUNT = 900
  const H = 12
  const pos = new Float32Array(COUNT * 3)
  const seed = new Float32Array(COUNT * 4)
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22
    pos[i * 3 + 1] = Math.random() * H
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6
    for (let k = 0; k < 4; k++) seed[i * 4 + k] = Math.random()
  }
  const emberGeo = new THREE.BufferGeometry()
  emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  emberGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
  const emberUniforms = { uTime: { value: 0 }, uH: { value: H }, uPR: { value: renderer.getPixelRatio() } }
  const embers = new THREE.Points(
    emberGeo,
    new THREE.ShaderMaterial({
      uniforms: emberUniforms,
      vertexShader: emberVert,
      fragmentShader: emberFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  embers.frustumCulled = false
  scene.add(embers)

  let baseScale = 1

  return {
    scene,
    camera,
    resize() {
      // Luna arriba a la derecha, sea cual sea la proporción de pantalla; más pequeña en vertical.
      const v = viewSize(camera, camera.position.z)
      baseScale = v.w < v.h ? Math.max(0.42, v.w / 8) : 1
      group.position.set(v.w / 2 - 3.3 * baseScale, v.h / 2 - 2.7 * baseScale, 0)
      emberUniforms.uPR.value = renderer.getPixelRatio()
    },
    update({ t, mx, my, progress }) {
      moonUniforms.uTime.value = t
      emberUniforms.uTime.value = t
      sphere.rotation.y = t * 0.04
      sphere.rotation.x = 0.25
      camera.position.x = mx * 0.35
      camera.position.y = -my * 0.25 - progress * 1.2
      camera.lookAt(0, -progress * 1.2, 0)
      group.scale.setScalar(baseScale * (1 + Math.max(0, progress) * 0.15))
    },
  }
}
