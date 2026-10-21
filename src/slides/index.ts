import { copy, logos, results, flags } from '../content'
import { mediaSlot } from '../ui/MediaSlot'

export type SceneKind = 'moon' | 'cards-dark' | 'cards-light' | 'galaxy' | 'slabs'

export interface SlideDef {
  id: string
  theme: 'dark' | 'light'
  bg: string
  scene?: SceneKind
  /** Capa a sangre (fuera del lienzo 16:9): media, escena, degradados. */
  bleed?: string
  /** Contenido maquetado sobre el lienzo de 1920 × 1080. */
  stage: string
}

const accent = (s: string) => s.replace(/\*(.+?)\*/g, '<span class="ac">$1</span>')

/** Titular: cada línea ("|") entra por separado en la animación escalonada. */
const title = (s: string, cls = '') =>
  `<h2 class="title ${cls}">${s
    .split('|')
    .map((l) => `<span class="line" data-a>${accent(l)}</span>`)
    .join('')}</h2>`

const caption = (s: string, cls = '') => `<p class="caption ${cls}" data-a>${accent(s)}</p>`
const pad = (n: number) => String(n).padStart(2, '0')

const c = copy

export const slideDefs: SlideDef[] = [
  // 01 · Apertura
  {
    id: 's01',
    theme: 'dark',
    bg: '#0A0910',
    stage: `
      <div class="s01-text">
        ${title(c.s01.title)}
        ${caption(c.s01.caption)}
      </div>
      <div class="s01-ads">
        <figure class="ad" data-a>
          <figcaption class="mono">${c.s01.adA}</figcaption>
          ${mediaSlot('ad-a', 'ad-slot', '9:16')}
        </figure>
        <figure class="ad ad--b" data-a>
          <figcaption class="mono">${c.s01.adB}</figcaption>
          ${mediaSlot('ad-b', 'ad-slot', '9:16')}
        </figure>
      </div>
      <p class="mono s01-vote" data-a><i class="dot"></i>${c.s01.vote}</p>
      <div class="scroll-cue" aria-hidden="true"><span></span></div>`,
  },
  // 02 · Idea central
  {
    id: 's02',
    theme: 'dark',
    bg: '#1E0A3C',
    stage: `
      <div class="s02-text">
        ${title(c.s02.title)}
        <p class="title s02-second" data-a>${c.s02.caption}</p>
      </div>
      <p class="mono s02-label" data-a><i class="rule"></i>${c.s02.label}</p>`,
  },
  // 03 · Quiénes somos
  {
    id: 's03',
    theme: 'light',
    bg: '#F4F3EF',
    stage: `
      <div class="s03-text">
        <img class="s03-logo" src="${logos.plugin}" alt="Plugin Creativo" data-a />
        ${title(c.s03.title)}
        ${caption(c.s03.caption)}
        <ul class="pills" data-a>
          ${c.s03.pills.map((p, i) => `<li class="pill pill--${i}">${p}</li>`).join('')}
        </ul>
      </div>
      <div class="s03-photo" data-a>${mediaSlot('team', 'team-slot', 'FOTO EQUIPO')}</div>`,
  },
  // 04 · Caso 01 · Screamfield
  {
    id: 's04',
    theme: 'dark',
    bg: '#050405',
    scene: flags.moon ? 'moon' : undefined,
    bleed: `${mediaSlot('screamfield-hero', 'bleed-media', 'VÍDEO HERO')}<div class="shade shade--left"></div>`,
    stage: `
      <div class="s04-brand" data-a>
        <img src="${logos.screamfield}" alt="Screamfield" />
        <p class="mono">${c.s04.label[0]}<span class="sep">/</span>${c.s04.label[1]}</p>
      </div>
      <div class="s04-text">
        ${title(c.s04.title)}
        ${caption(c.s04.caption)}
      </div>`,
  },
  // 05 · Screamfield Live
  {
    id: 's05',
    theme: 'dark',
    bg: '#0A0910',
    scene: 'cards-dark',
    bleed: `<div class="shade shade--left"></div>`,
    stage: `
      <p class="live-pill mono" data-a><i class="live-dot"></i>${c.s05.live}</p>
      <div class="s05-text">
        ${title(c.s05.title)}
        ${caption(c.s05.caption)}
      </div>`,
  },
  // 06 · Revelación A/B
  {
    id: 's06',
    theme: 'dark',
    bg: '#0A0910',
    stage: `
      <header class="s06-head">
        ${title(c.s06.title)}
        ${caption(c.s06.caption)}
      </header>
      <div class="s06-panels">
        ${(['a', 'b'] as const)
          .map(
            (k) => `
          <article class="result-panel" data-a>
            ${mediaSlot(k === 'a' ? 'ad-a' : 'ad-b', 'ad-slot', '9:16')}
            <div class="result-body">
              <h3 class="result-title">${k === 'a' ? c.s06.adA : c.s06.adB}</h3>
              <p class="mono result-label">${c.s06.results}</p>
              <dl class="result-rows">
                <div><dt class="mono">${c.s06.rows.periodo}</dt><dd>${results[k].periodo}</dd></div>
                <div><dt class="mono">${c.s06.rows.inversion}</dt><dd>${results[k].inversion}</dd></div>
                <div class="is-main"><dt class="mono">${c.s06.rows.metrica}</dt><dd>${results[k].metrica}</dd></div>
              </dl>
            </div>
          </article>`,
          )
          .join('')}
      </div>`,
  },
  // 07 · Diversificación creativa
  {
    id: 's07',
    theme: 'dark',
    bg: '#0A0910',
    stage: `
      <header class="s07-head">
        ${title(c.s07.title)}
        ${caption(c.s07.caption)}
      </header>
      <div class="s07-grid">
        ${c.s07.cards
          .map(
            (w, i) => `<div class="motive" data-a><span class="mono motive-n">${pad(i + 1)}</span><span class="motive-w">${w}</span></div>`,
          )
          .join('')}
      </div>`,
  },
  // 08 · Andromeda
  {
    id: 's08',
    theme: 'dark',
    bg: '#07061A',
    scene: 'galaxy',
    stage: `
      <div class="s08-text">
        ${title(c.s08.title)}
        ${caption(c.s08.caption)}
      </div>
      <ol class="flow">
        ${c.s08.steps
          .map(
            (s, i) => `${i ? '<li class="flow-arrow" aria-hidden="true" data-a>→</li>' : ''}
          <li class="flow-box${i === c.s08.highlight ? ' is-on' : ''}" data-a>
            ${i === c.s08.highlight ? `<span class="flow-tag mono">${c.s08.tag}</span>` : ''}
            <span class="mono flow-n">${pad(i + 1)}</span><span class="flow-w">${s}</span>
          </li>`,
          )
          .join('')}
      </ol>`,
  },
  // 09 · Caso 02 · WOW Stage
  {
    id: 's09',
    theme: 'light',
    bg: '#F4F3EF',
    bleed: `<div class="s09-media">${mediaSlot('wow-stage', 'bleed-media', 'VÍDEO / FOTO OFICIAL')}</div>`,
    stage: `
      <div class="s09-text">
        <p class="mono s09-label" data-a><i class="diamond"></i>${c.s09.label[0]}<span class="sep">/</span>${c.s09.label[1]}</p>
        ${title(c.s09.title)}
        ${caption(c.s09.caption)}
      </div>`,
  },
  // 10 · WOW Stage Live
  {
    id: 's10',
    theme: 'light',
    bg: '#F4F3EF',
    scene: 'cards-light',
    bleed: `<div class="shade shade--left shade--paper"></div>`,
    stage: `
      <p class="live-min mono" data-a><i class="live-dot"></i>${c.s10.live}</p>
      <div class="s10-text">
        ${title(c.s10.title)}
        ${caption(c.s10.caption)}
      </div>`,
  },
  // 11 · Agency life
  {
    id: 's11',
    theme: 'dark',
    bg: '#0A0910',
    bleed: `${mediaSlot('agency-life', 'bleed-media', 'FOTO DOCUMENTAL')}<div class="shade shade--bottom"></div>`,
    stage: `
      <div class="s11-text">
        ${title(c.s11.title)}
        <div class="s11-foot">
          ${caption(c.s11.caption)}
          <p class="mono s11-label" data-a>${c.s11.label}</p>
        </div>
      </div>`,
  },
  // 12 · Modelo de agencia
  {
    id: 's12',
    theme: 'light',
    bg: '#F4F3EF',
    stage: `
      <div class="s12-text">
        ${title(c.s12.title)}
        ${caption(c.s12.caption)}
      </div>
      <ol class="steps">
        <li class="steps-line" aria-hidden="true"><i></i></li>
        ${c.s12.steps
          .map(
            (s, i) =>
              `<li class="step${i === c.s12.steps.length - 1 ? ' is-last' : ''}"><span class="step-c mono">${pad(i + 1)}</span><span class="step-w">${s}</span></li>`,
          )
          .join('')}
      </ol>`,
  },
  // 13 · Creative challenge
  {
    id: 's13',
    theme: 'dark',
    bg: '#1E0A3C',
    stage: `
      <header class="s13-head">
        <div class="s13-text">
          ${title(c.s13.title)}
          ${caption(c.s13.caption)}
        </div>
        <div class="s13-side">
          <div class="case-box" data-a>
            <span class="mono">${c.s13.caseLabel}</span>
            <div class="case-field" contenteditable="true" spellcheck="false" aria-label="${c.s13.caseLabel}"></div>
          </div>
          <div class="countdown mono" aria-live="polite"></div>
        </div>
      </header>
      <div class="brief">
        ${c.s13.cards
          .map(
            (w, i) => `<div class="brief-card${i === 3 ? ' is-mint' : ''}" data-a><span class="mono">${pad(i + 1)}</span><strong>${w}</strong></div>`,
          )
          .join('')}
      </div>
      <div class="timebar" data-a>
        ${c.s13.phases
          .map(
            (p) =>
              `<div class="phase" style="flex:${p.weight}"><div class="phase-track"><i></i></div><span class="mono">${p.label}</span></div>`,
          )
          .join('')}
      </div>`,
  },
  // 14 · Cierre
  {
    id: 's14',
    theme: 'dark',
    bg: '#0A0910',
    scene: 'slabs',
    stage: `
      <div class="s14-text">
        ${title(c.s14.title)}
        <p class="title s14-second" data-a>${c.s14.caption}</p>
      </div>
      <footer class="s14-foot" data-a>
        <img src="${logos.plugin}" alt="Plugin Creativo" />
        <i class="vsep"></i>
        <span class="mono">${c.s14.footer}</span>
      </footer>`,
  },
]
