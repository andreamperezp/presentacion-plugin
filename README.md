# Plugin Creativo × Screamfield · Universidad Nebrija

Presentación web con scroll de 12 secciones (Vite + TypeScript + three.js + GSAP + Lenis).
Cada sección ocupa una pantalla; al hacer scroll, la siguiente sube como una cortina y la anterior se aleja.

## Uso

```bash
npm install
npm run dev       # desarrollo
npm run build     # carpeta estática en dist/ (funciona offline: abrir con `npm run preview` o cualquier servidor estático)
```

| Tecla | Acción |
| --- | --- |
| → ↓ Espacio PageDown / clic / flecha ↓ en pantalla | Sección siguiente |
| ← ↑ PageUp Retroceso / flecha ↑ en pantalla | Sección anterior |
| Botón ↑ en la última sección | Vuelve al inicio |
| Inicio / Fin | Primera / última |
| F | Pantalla completa |
| N | Ventana de notas del ponente (actual, siguiente, notas, reloj) |
| Clic / V / Enter (en la 05) | Abre el anuncio real del muro a pantalla completa (Esc o clic para cerrar) |
| T / R (en la 13) | Iniciar-pausar / reiniciar el temporizador 5 + 5 + 2 min |

La URL guarda la sección (`#5`). Imprimir (Ctrl/Cmd + P → Guardar como PDF) genera una página 1920 × 1080 por sección,
con las animaciones en su estado final y las escenas 3D como fotograma estático.

## Dónde cambiar cosas

Todo está en `src/content.ts`:

- `media`: rutas de imagen o vídeo (`.mp4` / `.webm`, autoplay muted loop). Copia los archivos a `public/assets/` y escribe
  p. ej. `'ad-a': './assets/anuncio-a.mp4'`. `ad-a` y `ad-b` se usan en la 01 y en la 06 (mismo archivo).
- `live-video`: el anuncio que se ve dentro del muro de la 05 y se abre al hacer clic (`public/assets/media/screamfield-live.mp4`).
- `results`: periodo, inversión y métrica de la 06. Se muestran como "—" hasta tener datos verificados.
- `flags.moon`: oculta la luna 3D de la 04.
- `copy`: textos exactos (`*texto*` = color de acento, `|` = salto de línea).
- `slides[].notes`: notas del ponente (las indicaciones visuales viven aquí, nunca en pantalla).

## Estructura

```
src/main.ts               DOM, scroll en cortinas, navegación, entradas animadas
src/content.ts            copy, notas y rutas (fuente única)
src/slides/index.ts       maquetación de cada sección
src/style.css             sistema visual; las medidas "128u" son píxeles del lienzo 1920 × 1080
src/three/                SceneManager + moon, cards, galaxy, slabs
src/ui/                   MediaSlot, Timer, PresenterView
```
