// Búsqueda tolerante a errores de escritura y acentos, sin dependencias externas.

export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Distancia de edición clásica, acotada para palabras cortas
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = curr
  }
  return prev[b.length]
}

// Tolerancia proporcional: 0 errores en palabras de ≤3 letras, 1 hasta 6, 2 a partir de ahí
function tolerance(term: string): number {
  if (term.length <= 3) return 0
  return term.length <= 6 ? 1 : 2
}

function termMatches(term: string, words: string[]): boolean {
  return words.some(
    (word) => word.startsWith(term) || word.includes(term) || levenshtein(term, word.slice(0, term.length + 1)) <= tolerance(term),
  )
}

// Devuelve los elementos cuyo texto contiene todos los términos (con tolerancia), ordenados por relevancia
export function fuzzySearch<T>(items: T[], query: string, getText: (item: T) => string): T[] {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return items

  return items
    .map((item) => {
      const text = normalizeText(getText(item))
      const words = text.split(/[^a-z0-9]+/).filter(Boolean)
      const matches = terms.every((term) => termMatches(term, words))
      const exact = terms.filter((term) => text.includes(term)).length
      return { item, matches, exact }
    })
    .filter((entry) => entry.matches)
    .sort((a, b) => b.exact - a.exact)
    .map((entry) => entry.item)
}
