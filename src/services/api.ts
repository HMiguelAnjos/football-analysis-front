import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type {
  AuthResponse,
  AuthUser,
  AdminUser,
  AdminUserUpdate,
  FootballMatch,
  MatchListResponse,
  MatchStatistics,
  MatchOdds,
  MarketLine,
  OddsBoardItem,
  FootballRecommendation,
  FootballLivePick,
  FootballLivePickCreate,
  FootballLivePickUpdate,
  LiveReco,
  FootballPickResult,
  FootballPerformanceSummary,
  FootballLeague,
  FootballTeam,
  FootballPlayer,
} from '../types'
import type {
  CompetitionInfo,
  WorldCupBracketStage,
  WorldCupGroup,
} from '../types'
import { getApiUrl } from '../config/env'
import { AUTH_DISABLED } from '../config/flags'
import { getContext } from '../config/competition'

// Prefixo de rota conforme o contexto ativo: futebol geral usa /football, Copa
// do Mundo usa /football/world-cup. Os MESMOS métodos servem os dois contextos.
function fb(path: string): string {
  return getContext() === 'world_cup' ? `/football/world-cup${path}` : `/football${path}`
}

// ── Token de sessão (área logada) ─────────────────────────────────────────
const TOKEN_KEY = 'clutchpro_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore (modo privado) */
  }
}
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

// ── Client HTTP único ───────────────────────────────────────────────────────
// Backend único de futebol: dados E autenticação no mesmo host. A baseURL é
// re-resolvida a cada request (suporta HMR/env em runtime). Token + handler
// de 401 centralizados.

const sharedTimeout = 60_000

function attachAuthHeader(config: InternalAxiosRequestConfig) {
  const t = getToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
}

const client = axios.create({ baseURL: getApiUrl(), timeout: sharedTimeout })
client.interceptors.request.use(config => {
  config.baseURL = getApiUrl()
  return attachAuthHeader(config)
})
client.interceptors.response.use(
  r => r,
  error => {
    const url: string = error?.config?.url ?? ''
    const status = error?.response?.status
    const isAuthRoute = url.includes('/auth/')
    // 401 fora das telas de auth → sessão expirou: limpa e manda pro login.
    // Desligado quando o login está desabilitado (modo dev).
    if (!AUTH_DISABLED && status === 401 && !isAuthRoute) {
      clearToken()
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

// Filtros comuns reaproveitados em várias listagens.
export interface MatchFilters {
  date?: string // YYYY-MM-DD
  league_id?: number | string
  country?: string
  status?: string
}

export interface RecommendationFilters {
  league_id?: number | string
  market?: string
  status?: string
}

function clean<T extends object>(params?: T) {
  if (!params) return undefined
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────
  register: (body: { email: string; password: string; name?: string }) =>
    client.post<AuthResponse>('/auth/register', body),
  login: (body: { email: string; password: string }) =>
    client.post<AuthResponse>('/auth/login', body),
  me: () => client.get<AuthUser>('/auth/me'),
  forgotPassword: (email: string) =>
    client.post<{ message: string }>('/auth/password/forgot', { email }),
  resetPassword: (token: string, new_password: string) =>
    client.post<AuthResponse>('/auth/password/reset', { token, new_password }),

  // ── Jogos (context-aware: futebol geral ou Copa do Mundo) ──────────────────
  getMatchesToday: () =>
    client.get<MatchListResponse>(fb('/matches/today')),
  getMatches: (filters?: MatchFilters) =>
    client.get<MatchListResponse>(fb('/matches'), { params: clean(filters) }),
  getMatch: (id: number | string) =>
    client.get<FootballMatch>(fb(`/matches/${id}`)),
  getMatchStatistics: (id: number | string) =>
    client.get<MatchStatistics>(fb(`/matches/${id}/statistics`)),
  getMatchOdds: (id: number | string) =>
    client.get<MatchOdds>(fb(`/matches/${id}/odds`)),
  getMatchMarkets: (id: number | string) =>
    client.get<MarketLine[]>(fb(`/matches/${id}/markets`)),
  getMatchProps: (id: number | string) =>
    client.get<FootballRecommendation[]>(fb(`/matches/${id}/props`)),

  // ── Recomendações do modelo ────────────────────────────────────────────────
  getRecommendations: (filters?: RecommendationFilters) =>
    client.get<FootballRecommendation[]>(fb('/recommendations'), {
      params: clean(filters),
    }),
  getRecommendation: (id: number | string) =>
    client.get<FootballRecommendation>(fb(`/recommendations/${id}`)),
  generateRecommendations: (body?: Record<string, unknown>) =>
    client.post<FootballRecommendation[]>(fb('/recommendations/generate'), body ?? {}),
  getOpportunities: (params?: { limit?: number }) =>
    client.get<FootballRecommendation[]>(fb('/recommendations/opportunities'), { params: clean(params) }),
  // Feed global de player props (artilheiro, chutes no gol) dos próximos jogos.
  getProps: (params?: { limit?: number }) =>
    client.get<FootballRecommendation[]>(fb('/props'), { params: clean(params) }),
  // Picks de valor AO VIVO (modelo in-play × odd ao vivo).
  getLiveOpportunities: (params?: { limit?: number }) =>
    client.get<FootballRecommendation[]>(fb('/live-opportunities'), { params: clean(params) }),
  // Especialista em CHUTES A GOL ao vivo (jogadores prováveis de chutar mais).
  getLiveShots: (params?: { limit?: number }) =>
    client.get<FootballRecommendation[]>(fb('/live-shots'), { params: clean(params) }),
  // GOLS ao vivo: jogador que ainda pode marcar (taxa + pressão + pênalti).
  getLiveGoals: (params?: { limit?: number }) =>
    client.get<FootballRecommendation[]>(fb('/live-goals'), { params: clean(params) }),
  // Recomendações AO VIVO persistidas (foco escanteios) — pendentes.
  getLiveRecs: () =>
    client.get<LiveReco[]>('/football/live-recommendations/pending', {
      params: clean({ context: getContext() }),
    }),
  setLiveRecResult: (id: number | string, result: 'green' | 'red' | 'void' | 'pending') =>
    client.patch<LiveReco>(`/football/live-recommendations/${id}/result`, null, {
      params: { result },
    }),

  // ── Entradas ao vivo (publicadas por analistas) ─────────────────────────────
  getLivePicks: () =>
    client.get<FootballLivePick[]>(fb('/recommendations/live')),
  createLivePick: (body: FootballLivePickCreate) =>
    client.post<FootballLivePick>(fb('/live-picks'), body),
  updateLivePick: (id: number | string, patch: FootballLivePickUpdate) =>
    client.patch<FootballLivePick>(fb(`/live-picks/${id}`), patch),
  deleteLivePick: (id: number | string) =>
    client.delete<void>(fb(`/live-picks/${id}`)),

  // ── Resultados / performance ────────────────────────────────────────────────
  getPickResults: () => client.get<FootballPickResult[]>(fb('/pick-results')),
  getPerformance: () =>
    client.get<FootballPerformanceSummary>(fb('/performance')),

  // ── Catálogos ───────────────────────────────────────────────────────────────
  // Ligas/jogadores/odds-board não existem no contexto Copa → sempre geral.
  getLeagues: () => client.get<FootballLeague[]>('/football/leagues'),
  getTeams: (params?: { league_id?: number | string; search?: string }) =>
    client.get<FootballTeam[]>(fb('/teams'), { params: clean(params) }),
  getTeam: (id: number | string) => client.get<FootballTeam>(fb(`/teams/${id}`)),
  getPlayers: (params?: { team_id?: number | string; search?: string }) =>
    client.get<FootballPlayer[]>(fb('/players'), { params: clean(params) }),
  getPlayerLeaders: (params?: { metric?: string; limit?: number }) =>
    client.get<FootballPlayer[]>(fb('/players/leaders'), { params: clean(params) }),
  getPlayerIndex: (params?: { index?: string; limit?: number }) =>
    client.get<FootballPlayer[]>(fb('/players/index'), { params: clean(params) }),
  getPlayer: (id: number | string) =>
    client.get<FootballPlayer>(fb('/players/' + id)),
  getOdds: (params?: { league_id?: number | string; market?: string }) =>
    client.get<OddsBoardItem[]>('/football/odds', { params: clean(params) }),

  // ── Copa do Mundo (exclusivos do torneio) ──────────────────────────────────
  getContexts: () => client.get<CompetitionInfo[]>('/football/context'),
  getGroups: () => client.get<WorldCupGroup[]>('/football/world-cup/groups'),
  getBracket: () => client.get<WorldCupBracketStage[]>('/football/world-cup/bracket'),

  // ── Admin (mesmo backend) ───────────────────────────────────────────────────
  getAdminUsers: (search?: string) =>
    client.get<AdminUser[]>('/admin/users', { params: clean({ search }) }),
  updateAdminUser: (userId: number, patch: AdminUserUpdate) =>
    client.patch<AdminUser>(`/admin/users/${userId}`, patch),
}
