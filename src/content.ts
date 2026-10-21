// Fuente única de copy, notas y rutas de media.
// Marcado del copy: *texto* = color de acento de la sección · | = salto de línea.
// Regla editorial: copy exacto, sin métricas inventadas ("—" hasta tener datos verificados).

/** Rutas de media. Deja '' para mostrar el placeholder. Admite imagen o vídeo (.mp4 / .webm). */
export const media = {
  'ad-a': '', // Anuncio A (Screamfield, 9:16) — mismo archivo en 01 y 06
  'ad-b': '', // Anuncio B (Screamfield, 9:16) — mismo archivo en 01 y 06
  team: '', // Foto real de Mike y Eduardo / equipo (03)
  'screamfield-hero': '', // Vídeo hero o fotograma de Screamfield (04)
  'wow-stage': '', // Vídeo / foto oficial de WOW Stage (09)
  'agency-life': '', // Foto documental de Plugin trabajando (11)
} satisfies Record<string, string>

export type MediaKey = keyof typeof media

export const logos = {
  plugin: './assets/plugin-logo.png',
  screamfield: './assets/screamfield-logo.jpg',
}

export const flags = {
  /** Luna 3D sobre el hero de la 04. Pon false cuando llegue el vídeo real si sobra. */
  moon: true,
}

/** Resultados A/B (06). Solo datos reales, verificados y fechados. */
export const results = {
  a: { periodo: '—', inversion: '—', metrica: '—' },
  b: { periodo: '—', inversion: '—', metrica: '—' },
}

export const copy = {
  s01: {
    title: '¿CUÁL DE ESTOS DOS ANUNCIOS VENDIÓ MÁS *ENTRADAS?*',
    caption: 'Antes de ver los números, decide en cuál invertirías.',
    adA: 'ANUNCIO A',
    adB: 'ANUNCIO B',
    vote: 'VOTA Y EXPLICA POR QUÉ',
  },
  s02: {
    title: 'EL CONTENIDO NO TERMINA CUANDO PUBLICAS.',
    caption: 'EMPIEZA CUANDO EL MERCADO RESPONDE.',
    label: 'DE CONTENIDO A CRECIMIENTO',
  },
  s03: {
    title: 'PLUGIN|*CREATIVO.*',
    caption:
      'Una agencia de estrategia y crecimiento que conecta creatividad, publicidad y decisiones de negocio.',
    pills: ['ESTRATEGIA', 'CREATIVIDAD', 'PERFORMANCE', 'CRECIMIENTO'],
  },
  s04: {
    label: ['SCREAMFIELD', 'MADRID'],
    title: '¿CÓMO VENDES UNA EXPERIENCIA QUE TU PÚBLICO *TODAVÍA NO HA VIVIDO?*',
    caption: 'Antes de que pudieran contarla, teníamos que conseguir que quisieran vivirla.',
  },
  s05: {
    live: 'LIVE · SCREAMFIELD EN ADS MANAGER',
    title: '*+100 ANUNCIOS.*|UN OBJETIVO.|DISTINTOS ENFOQUES.',
    caption: 'Actores. UGC. Calle. Backstage. Experiencia. Urgencia.',
  },
  s06: {
    title: 'LO QUE MÁS TE GUSTA NO SIEMPRE ES LO QUE MEJOR FUNCIONA.',
    caption: 'Ahora sí: miremos qué consiguió cada anuncio. Y qué podemos concluir realmente.',
    adA: 'ANUNCIO A',
    adB: 'ANUNCIO B',
    results: 'RESULTADOS REALES',
    rows: { periodo: 'PERIODO', inversion: 'INVERSIÓN', metrica: 'MÉTRICA PRINCIPAL' },
  },
  s07: {
    title: 'CAMBIAR EL VÍDEO NO SIEMPRE ES CAMBIAR LA IDEA.',
    caption:
      'Diversificar es explorar razones distintas para comprar, no repetir la misma promesa con otro montaje.',
    cards: ['MIEDO', 'EXPERIENCIA', 'PRUEBA SOCIAL', 'BACKSTAGE', 'PLAN CON AMIGOS', 'FECHA Y URGENCIA'],
  },
  s08: {
    title: '*ANDROMEDA:* EL SISTEMA CAMBIA. LA ESTRATEGIA TAMBIÉN.',
    caption: 'No se trata de multiplicar copias. Se trata de crear conceptos y mensajes realmente distintos.',
    steps: ['ANUNCIOS', 'SELECCIÓN INICIAL', 'RANKING Y ENTREGA', 'RESPUESTA'],
    tag: 'ANDROMEDA',
    highlight: 1, // índice de "SELECCIÓN INICIAL": la única fase resaltada
  },
  s09: {
    label: ['WOW STAGE', 'SEGUNDO CASO REAL'],
    title: 'MISMA PLATAFORMA.|*OTRO PÚBLICO.*|*OTRA HISTORIA.*',
    caption:
      'Lo que funciona para una experiencia no tiene por qué funcionar para otra. Cambian las motivaciones.',
  },
  s10: {
    live: 'LIVE · WOW STAGE EN ADS MANAGER',
    title: 'EL FORMATO|NO ES LA|*ESTRATEGIA.*',
    caption: 'Antes de copiar un anuncio, entiende a quién habla, qué promete y qué quiere conseguir.',
  },
  s11: {
    title: 'SER DUEÑO DE UNA AGENCIA NO ES HACER REELS TODO EL DÍA.',
    caption: 'Hay decisiones, presupuestos, equipos y problemas que ningún dashboard resuelve por sí solo.',
    label: 'ESTRATEGIA · EQUIPO · CLIENTES · NEGOCIO',
  },
  s12: {
    title: 'EL CLIENTE NO COMPRA UN REEL.|*COMPRA UNA SOLUCIÓN.*',
    caption: 'La pregunta no es «¿qué publicamos?», sino «¿qué problema estamos intentando resolver?».',
    steps: ['PROBLEMA', 'HIPÓTESIS', 'PRODUCCIÓN', 'MEDICIÓN', 'DECISIÓN'],
  },
  s13: {
    title: 'TENÉIS CLIENTE. TENÉIS RECURSOS.|*¿QUÉ PRODUCÍS MAÑANA?*',
    caption: 'Una idea nueva. Un público concreto. Una hipótesis que podamos poner a prueba.',
    caseLabel: 'CASO',
    cards: ['PÚBLICO', 'MOTIVACIÓN', 'HOOK', 'FORMATO'],
    phases: [
      { label: '5 MIN PARA PENSAR', minutes: 5, weight: 5 },
      { label: '5 MIN PARA DEFENDER', minutes: 5, weight: 5 },
      { label: '2 MIN DE FEEDBACK', minutes: 2, weight: 3 },
    ],
  },
  s14: {
    title: 'NO ESPERES A TRABAJAR PARA UNA GRAN MARCA.',
    caption: 'APRENDE A HACER GRANDE UNA MARCA.',
    footer: 'CREATIVE. PERFORMANCE. GROWTH.',
  },
}

/** Notas del ponente (ventana N). Aquí van las indicaciones visuales: nunca en pantalla. */
export const slides = [
  {
    name: 'Apertura · Interacción',
    notes:
      'Pantalla dividida con dos miniaturas o fotogramas REALES de Screamfield. Resultados ocultos; sin cifras ni pistas sobre el ganador.\nMaterial pendiente: dos creatividades reales A/B autorizadas y comparables.',
  },
  {
    name: 'Idea central',
    notes:
      'Pantalla tipográfica de alto impacto. La segunda frase pesa tanto como la primera. Sin iconos, gráficos ni bloques explicativos.',
  },
  {
    name: 'Quiénes somos',
    notes:
      'Fotografía real de Mike y Eduardo, o del equipo. Branding actual; evitar mosaico de clientes y cronología.\nMaterial pendiente: fotografía real aprobada de fundadores/equipo.',
  },
  {
    name: 'Caso 01 · Screamfield',
    notes:
      'Vídeo hero o fotograma cinematográfico real de Screamfield. Predominio de imagen; titular grande y caption muy corto.\nMaterial pendiente: vídeo o fotos autorizadas del parque.',
  },
  {
    name: 'Screamfield · Live',
    notes:
      'Diapositiva puente hacia el navegador. Dejar aire para pasar al directo. NO simular capturas de Ads Manager (solo una captura real y fechada como plan B).\nMaterial pendiente: cuenta publicitaria real / captura de respaldo autorizada.',
  },
  {
    name: 'Revelación A/B',
    notes:
      'Recuperar exactamente las dos piezas de la 01. Comparativa real con periodo, inversión y métrica principal legibles.\nMétricas verificadas y fechadas; no inventar ni insinuar causalidad.',
  },
  {
    name: 'Diversificación creativa',
    notes:
      'Seis territorios en mosaico 2 × 3. Cada tarjeta es una motivación, NO un tipo de archivo o resolución.\nOpcional: imagen real por concepto; no generar resultados ficticios.',
  },
  {
    name: 'Andromeda',
    notes:
      'Diagrama de cuatro pasos con Andromeda identificada únicamente en la fase de selección inicial. NO representarla como todo el algoritmo de Meta.',
  },
  {
    name: 'Caso 02 · WOW Stage',
    notes:
      'Creatividad real de WOW Stage con contraste visual claro respecto a Screamfield. Evitar cifras u objetivos no verificados.\nMaterial pendiente: vídeo o fotografía oficial autorizada de WOW Stage.',
  },
  {
    name: 'WOW Stage · Live',
    notes:
      'Pantalla puente para abrir la segunda cuenta. Jerarquía máxima para la frase y mínima para el marcador LIVE.\nMaterial pendiente: cuenta publicitaria real / captura de respaldo autorizada.',
  },
  {
    name: 'Agency life',
    notes:
      'Fotografía documental auténtica de Plugin trabajando: reunión, producción, dirección o revisión creativa. Nada de stock.\nMaterial pendiente: foto real de Mike, Eduardo o el equipo.',
  },
  {
    name: 'Modelo de agencia',
    notes:
      'Composición tipográfica más una secuencia de cinco pasos. Evitar embudo complejo y jerga extra: síntesis del método Plugin.',
  },
  {
    name: 'Creative challenge',
    notes:
      'Estructura de brief de agencia. Las cuatro variables deben verse desde el fondo del aula. Escribe el caso elegido en la caja CASO.\nTecla T: inicia / pausa el temporizador (5 + 5 + 2 min). Tecla R: reinicia.\nElegir Screamfield o WOW Stage previamente. Sin inventar recursos o límites reales.',
  },
  {
    name: 'Cierre',
    notes:
      'Cierre puramente editorial: titular en dos golpes, logo actual y mucho espacio negativo. Sin CTA, QR ni texto adicional.',
  },
]
