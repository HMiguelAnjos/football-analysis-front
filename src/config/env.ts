/**
 * Resolução da URL da API de futebol — backend ÚNICO.
 *
 * Prioridade:
 *   window.__APP_CONFIG__.VITE_FOOTBALL_API_URL  (env.js gerado no container)
 *   → import.meta.env.VITE_FOOTBALL_API_URL       (.env no dev)
 *   → VITE_API_URL (legado, compat)               (runtime / .env)
 *   → http://localhost:8000                        (fallback dev)
 *
 * O mesmo artefato `dist/` funciona em qualquer ambiente porque a URL é
 * lida em RUNTIME (env.js), não embutida no build.
 */

type AppConfig = {
  VITE_FOOTBALL_API_URL?: string
  /** Compat com o setup single-backend antigo. */
  VITE_API_URL?: string
}

const runtime: AppConfig =
  (window as Window & { __APP_CONFIG__?: AppConfig }).__APP_CONFIG__ ?? {}

function normalizeUrl(value?: string): string | undefined {
  if (!value) return undefined
  const unquoted = value.trim().replace(/^['"]|['"]$/g, '')
  const trimmed = unquoted.replace(/\/$/, '')
  if (!trimmed) return undefined
  // Aceita "host" sem protocolo (prefixa https://). "/host" também vira host.
  const cleaned = trimmed.replace(/^\/+/, '')
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  return `https://${cleaned}`
}

const API_URL =
  normalizeUrl(runtime.VITE_FOOTBALL_API_URL) ||
  normalizeUrl(import.meta.env.VITE_FOOTBALL_API_URL as string | undefined) ||
  normalizeUrl(runtime.VITE_API_URL) ||
  normalizeUrl(import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:8000'

/**
 * URL base da API de futebol. Backend único: dados E autenticação vivem no
 * mesmo host. Lida via função (não const exportada) pra manter o padrão de
 * "re-resolver a cada request" no axios interceptor — robusto a HMR no dev.
 */
export function getApiUrl(): string {
  return API_URL
}
