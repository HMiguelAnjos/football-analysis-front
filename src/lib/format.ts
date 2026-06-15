// ─── Helpers de formatação de texto ──────────────────────────────────────────

// Conectores comuns em nomes PT-BR. Ficam minúsculos no MEIO do nome
// (ex: "João da Silva"), mas capitalizam se forem a primeira palavra.
const NAME_CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/**
 * Formata um nome próprio em "title case": cada palavra com a primeira
 * letra maiúscula e o resto minúsculo, independente de como foi digitado
 * ("HENRIQUE MIGUEL", "henrique miguel" → "Henrique Miguel").
 *
 * Conectores PT-BR (de/da/do/das/dos/e) ficam minúsculos quando não são
 * a primeira palavra, pra leitura natural ("João da Silva").
 *
 * Robusto a múltiplos espaços e strings vazias.
 */
export function toDisplayName(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (!word) return word
      if (i > 0 && NAME_CONNECTORS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
