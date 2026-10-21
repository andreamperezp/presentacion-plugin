import { defineConfig, type Plugin } from 'vite'

// Permite escribir medidas del lienzo 1920×1080 como "128u" en style.css.
// Se convierten a calc(var(--u) * 128), donde --u escala el lienzo a la pantalla.
function canvasUnits(): Plugin {
  return {
    name: 'canvas-units',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('style.css')) return
      return code.replace(/(?<![\w#.-])(-?\d*\.?\d+)u\b/g, 'calc(var(--u) * $1)')
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [canvasUnits()],
  build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 1200 },
})
