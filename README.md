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
| N | Ventana de notas: quién habla, tiempo de la sección según la escaleta (90 min), notas, siguiente ponente y reloj total |
| T / R (en la sección del reto) | Iniciar-pausar / reiniciar el temporizador 5 + 5 + 2 min |

La URL guarda la sección (`#5`).

**Móvil y tablet:** en pantallas de hasta 1024 px de ancho (y tablets en vertical) la web no encoge el lienzo de 1920 × 1080: cada sección se maqueta en columna, con tamaños de lectura estándar, y se navega con scroll normal (las flechas de la esquina también funcionan). Los estilos están al final de `src/style.css`, bajo `html.web`. Imprimir (Ctrl/Cmd + P → Guardar como PDF) genera una página 1920 × 1080 por sección,
con las animaciones en su estado final y las escenas 3D como fotograma estático.

## Dónde cambiar cosas

Todo está en `src/content.ts`:

- `media`: rutas de imagen o vídeo (`.mp4` / `.webm`, autoplay muted loop). Copia los archivos a `public/assets/` y escribe
  p. ej. `'pieza-a': './assets/anuncio-a.mp4'`. `pieza-a` y `pieza-b` se ven dentro de un teléfono en la 01 y en la 06 (mismo archivo); no arrancan solos, se reproducen con sonido al pulsar play.
- `live-video`: vídeo opcional dentro del muro de la 05 (se abre a pantalla completa al hacer clic). Vacío = muro solo con piezas estáticas.
- `results`: tabla de resultados de la 06 (filas, métrica principal y fuente).
- `wall`: atlas con las piezas reales del muro de la 05 (`public/assets/media/muro-screamfield.jpg`, 29 piezas en celdas 9:16).
- `flags.moon`: oculta la luna 3D de la 04.
- `copy`: textos exactos (`*texto*` = color de acento, `|` = salto de línea).
- `slides[].speaker` / `slides[].minutes`: escaleta (un solo ponente por sección).
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
