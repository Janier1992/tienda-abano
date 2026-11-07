// Genera las ilustraciones vectoriales del modo prototipo en public/demo/.
// Uso: node scripts/generar-ilustraciones-demo.mjs
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'public/demo'
const W = 800
const H = 1000

// Fondo común: foco cálido y sombra de apoyo
const stage = (id, glow = '#3a2b1f') => `
  <defs>
    <radialGradient id="${id}-bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="${glow}"/><stop offset="0.55" stop-color="#17110d"/><stop offset="1" stop-color="#0c0907"/>
    </radialGradient>
    <linearGradient id="${id}-cedar" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#b9774a"/><stop offset="0.5" stop-color="#8e5532"/><stop offset="1" stop-color="#5e3520"/>
    </linearGradient>
    <linearGradient id="${id}-leaf" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#9a6238"/><stop offset="0.45" stop-color="#6e3f22"/><stop offset="1" stop-color="#3f2213"/>
    </linearGradient>
    <linearGradient id="${id}-gold" x1="0" x2="1">
      <stop offset="0" stop-color="#8f6a32"/><stop offset="0.35" stop-color="#f1d79b"/><stop offset="0.6" stop-color="#c9a160"/><stop offset="1" stop-color="#7d5a28"/>
    </linearGradient>
    <linearGradient id="${id}-metal" x1="0" x2="1">
      <stop offset="0" stop-color="#5b544c"/><stop offset="0.3" stop-color="#e9e1d3"/><stop offset="0.55" stop-color="#a9a093"/><stop offset="1" stop-color="#4a443d"/>
    </linearGradient>
    <filter id="${id}-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
    <filter id="${id}-soft"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>
  <circle cx="400" cy="360" r="260" fill="#e2b979" opacity="0.13" filter="url(#${id}-glow)"/>
`

// Puro horizontal con anilla dorada
function cigar(id, x, y, len, thick, band = `url(#${id}-gold)`, rot = 0) {
  const r = thick / 2
  const veins = [0.3, 0.55, 0.78].map((f) => `<path d="M${x + 12} ${y + thick * f} Q ${x + len / 2} ${y + thick * f - 3} ${x + len - 16} ${y + thick * f + 2}" stroke="#2c170c" stroke-opacity="0.35" stroke-width="1.4" fill="none"/>`).join('')
  return `<g transform="rotate(${rot} ${x + len / 2} ${y + r})">
    <rect x="${x}" y="${y}" width="${len}" height="${thick}" rx="${r}" fill="url(#${id}-leaf)"/>
    ${veins}
    <rect x="${x}" y="${y}" width="${len}" height="${thick * 0.32}" rx="${r * 0.6}" fill="#fff" opacity="0.07"/>
    <rect x="${x + len * 0.16}" y="${y - 1}" width="${len * 0.11}" height="${thick + 2}" rx="3" fill="${band}"/>
    <rect x="${x + len * 0.195}" y="${y + thick * 0.3}" width="${len * 0.04}" height="${thick * 0.4}" rx="2" fill="#3b2410" opacity="0.6"/>
  </g>`
}

function grain(x, y, w, h, count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const yy = y + (h / count) * i + 6
    return `<path d="M${x} ${yy} C ${x + w * 0.3} ${yy - 5}, ${x + w * 0.6} ${yy + 6}, ${x + w} ${yy - 2}" stroke="#3b1f10" stroke-opacity="${0.18 + (i % 3) * 0.06}" stroke-width="1.6" fill="none"/>`
  }).join('')
}

const svg = (body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${body}</svg>\n`

const ART = {
  'caja-abierta': (id) => svg(`${stage(id)}
    <ellipse cx="400" cy="800" rx="290" ry="40" fill="#000" opacity="0.6" filter="url(#${id}-shadow)"/>
    <g transform="rotate(-7 400 520)" filter="url(#${id}-soft)">
      <rect x="130" y="250" width="540" height="540" rx="18" fill="url(#${id}-cedar)"/>${grain(130, 250, 540, 540, 22)}
      <rect x="165" y="285" width="470" height="470" rx="8" fill="#1d120b"/>
      ${Array.from({ length: 9 }, (_, i) => cigar(id, 180, 298 + i * 50, 440, 42)).join('')}
      <rect x="130" y="250" width="540" height="540" rx="18" fill="none" stroke="#f1d79b" stroke-opacity="0.25" stroke-width="2"/>
    </g>
    <circle cx="640" cy="230" r="46" fill="url(#${id}-gold)" opacity="0.92"/><circle cx="640" cy="230" r="34" fill="none" stroke="#3b2410" stroke-opacity="0.5" stroke-width="2"/>`, 'Caja abierta de cedro con veinticinco puros'),

  estuche: (id) => svg(`${stage(id, '#2c2a22')}
    <ellipse cx="400" cy="840" rx="200" ry="34" fill="#000" opacity="0.6" filter="url(#${id}-shadow)"/>
    ${[0, 1, 2].map((i) => cigar(id, 0, 0, 260, 54).replace('<g transform="rotate(0 130 27)">', `<g transform="translate(${282 + i * 64} ${150 + (i % 2) * 24}) rotate(90 27 27)">`)).join('')}
    <g filter="url(#${id}-soft)">
      <rect x="250" y="300" width="300" height="560" rx="70" fill="#2a1b13"/>
      <rect x="250" y="300" width="300" height="560" rx="70" fill="url(#${id}-leaf)" opacity="0.35"/>
      <rect x="268" y="318" width="264" height="524" rx="56" fill="none" stroke="#e9c98c" stroke-opacity="0.55" stroke-width="2.5" stroke-dasharray="10 9"/>
      <rect x="250" y="300" width="80" height="560" rx="40" fill="#fff" opacity="0.05"/>
      <circle cx="400" cy="560" r="48" fill="none" stroke="url(#${id}-gold)" stroke-width="3"/>
      <text x="400" y="575" text-anchor="middle" font-family="Georgia, serif" font-size="44" font-style="italic" fill="#e8c88a">C</text>
    </g>`, 'Estuche de piel para tres puros'),

  tubo: (id) => svg(`${stage(id, '#2d2924')}
    <ellipse cx="420" cy="830" rx="260" ry="34" fill="#000" opacity="0.6" filter="url(#${id}-shadow)"/>
    <g transform="rotate(-28 400 520)" filter="url(#${id}-soft)">
      <rect x="160" y="470" width="520" height="92" rx="46" fill="url(#${id}-metal)"/>
      <rect x="160" y="470" width="520" height="22" rx="11" fill="#fff" opacity="0.25"/>
      <rect x="560" y="462" width="130" height="108" rx="40" fill="url(#${id}-gold)"/>
      <rect x="300" y="470" width="130" height="92" fill="#1b130e"/>
      <rect x="300" y="470" width="130" height="92" fill="url(#${id}-gold)" opacity="0.18"/>
      <text x="365" y="526" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-style="italic" fill="#e8c88a">Reserva</text>
    </g>
    ${cigar(id, 190, 700, 420, 46, `url(#${id}-gold)`, -10)}`, 'Tubo metálico individual junto a un puro'),

  humidor: (id) => svg(`${stage(id)}
    <ellipse cx="400" cy="840" rx="310" ry="40" fill="#000" opacity="0.65" filter="url(#${id}-shadow)"/>
    <g filter="url(#${id}-soft)">
      <path d="M140 380 L400 300 L660 380 L400 460 Z" fill="#c38457"/>${'' /* tapa */}
      <path d="M140 380 L400 300 L660 380 L400 460 Z" fill="#fff" opacity="0.06"/>
      <path d="M140 380 L400 460 L400 800 L140 720 Z" fill="url(#${id}-cedar)"/>
      <path d="M400 460 L660 380 L660 720 L400 800 Z" fill="#5c331d"/>
      ${grain(150, 470, 240, 260, 10)}
      <path d="M140 430 L400 510 L660 430" fill="none" stroke="url(#${id}-gold)" stroke-width="4"/>
      <ellipse cx="400" cy="380" rx="62" ry="22" fill="url(#${id}-gold)"/>
      <ellipse cx="400" cy="378" rx="46" ry="15" fill="#f4ead8"/>
      <path d="M400 378 L424 372" stroke="#3b2410" stroke-width="3" stroke-linecap="round"/>
      <rect x="380" y="520" width="40" height="56" rx="8" fill="url(#${id}-gold)"/>
      <circle cx="400" cy="548" r="7" fill="#3b2410"/>
    </g>`, 'Humidor de madera de cedro con higrómetro'),

  cortador: (id) => svg(`${stage(id, '#2b2721')}
    <ellipse cx="400" cy="800" rx="230" ry="32" fill="#000" opacity="0.6" filter="url(#${id}-shadow)"/>
    <g transform="rotate(-14 400 500)" filter="url(#${id}-soft)">
      <rect x="150" y="390" width="500" height="220" rx="110" fill="url(#${id}-metal)"/>
      <rect x="150" y="390" width="500" height="60" rx="30" fill="#fff" opacity="0.22"/>
      <circle cx="400" cy="500" r="72" fill="#120d0a"/>
      <circle cx="400" cy="500" r="72" fill="none" stroke="url(#${id}-gold)" stroke-width="6"/>
      <circle cx="225" cy="500" r="40" fill="#120d0a" opacity="0.85"/>
      <circle cx="575" cy="500" r="40" fill="#120d0a" opacity="0.85"/>
      <path d="M180 500 H620" stroke="#2b2520" stroke-opacity="0.5" stroke-width="2"/>
    </g>`, 'Cortador de doble hoja metálico'),

  degustacion: (id) => svg(`${stage(id)}
    <ellipse cx="400" cy="820" rx="300" ry="40" fill="#000" opacity="0.6" filter="url(#${id}-shadow)"/>
    <g transform="rotate(6 400 520)" filter="url(#${id}-soft)">
      <rect x="120" y="270" width="560" height="500" rx="18" fill="url(#${id}-cedar)"/>${grain(120, 270, 560, 500, 20)}
      <rect x="150" y="300" width="500" height="440" rx="8" fill="#1d120b"/>
      ${['#c9a160', '#9c3b2b', '#e8e0cf', '#2f4a3a', '#c9a160'].map((c, i) => `
        <rect x="160" y="${310 + i * 86}" width="480" height="78" rx="6" fill="#2a1a10"/>
        ${cigar(id, 172, 322 + i * 86, 456, 54, c)}`).join('')}
    </g>`, 'Caja de degustación con cinco puros de anillas distintas'),
}

mkdirSync(OUT, { recursive: true })
for (const [name, draw] of Object.entries(ART)) {
  writeFileSync(`${OUT}/${name}.svg`, draw(name.replace(/[^a-z]/g, '')), 'utf8')
  console.log('✓', `${OUT}/${name}.svg`)
}
