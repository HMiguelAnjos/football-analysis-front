// ─── Bandeiras de seleção (flagcdn.com — grátis, sem chave) ──────────────────
// O CDN de logos da api-football (media.api-sports.io) está fora do ar, então
// pra seleções usamos a bandeira do país via flagcdn. Mapa nome→ISO 3166-1
// alpha-2 (Inglaterra/Escócia usam subdivisões gb-eng/gb-sct do flagcdn).
// Clubes (sem match no mapa) → null → o TeamBadge cai nas iniciais.

// Normaliza pra casar nomes entre fontes: minúsculo, sem acento, sem "&"/extra.
function norm(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos (Türkiye→turkiye, Curaçao→curacao)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Seleções da Copa 2026 + apelidos comuns entre fontes (nome normalizado → código).
const FLAG_CODES: Record<string, string> = {
  algeria: 'dz',
  argentina: 'ar',
  australia: 'au',
  austria: 'at',
  belgium: 'be',
  'bosnia and herzegovina': 'ba',
  brazil: 'br',
  canada: 'ca',
  'cape verde islands': 'cv',
  'cape verde': 'cv',
  colombia: 'co',
  'congo dr': 'cd',
  'dr congo': 'cd',
  croatia: 'hr',
  curacao: 'cw',
  czechia: 'cz',
  'czech republic': 'cz',
  ecuador: 'ec',
  egypt: 'eg',
  england: 'gb-eng',
  france: 'fr',
  germany: 'de',
  ghana: 'gh',
  haiti: 'ht',
  iran: 'ir',
  'ir iran': 'ir',
  iraq: 'iq',
  'ivory coast': 'ci',
  'cote d ivoire': 'ci',
  japan: 'jp',
  jordan: 'jo',
  mexico: 'mx',
  morocco: 'ma',
  netherlands: 'nl',
  'new zealand': 'nz',
  norway: 'no',
  panama: 'pa',
  paraguay: 'py',
  portugal: 'pt',
  qatar: 'qa',
  'saudi arabia': 'sa',
  scotland: 'gb-sct',
  wales: 'gb-wls',
  'northern ireland': 'gb-nir',
  senegal: 'sn',
  'south africa': 'za',
  'south korea': 'kr',
  'korea republic': 'kr',
  spain: 'es',
  sweden: 'se',
  switzerland: 'ch',
  tunisia: 'tn',
  turkiye: 'tr',
  turkey: 'tr',
  usa: 'us',
  'united states': 'us',
  uruguay: 'uy',
  uzbekistan: 'uz',
}

/** URL da bandeira (flagcdn, ~80px) pra uma seleção, ou null se não for país
 * mapeado (ex.: clube). `width` casa com o tamanho do badge. */
export function flagUrl(teamName?: string | null, width: 40 | 80 | 160 = 80): string | null {
  if (!teamName) return null
  const code = FLAG_CODES[norm(teamName)]
  if (!code) return null
  return `https://flagcdn.com/w${width}/${code}.png`
}
