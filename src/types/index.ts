// ─────────────────────────────────────────────────────────────────────────────
// ClutchPro Football — contratos de tipos do frontend.
//
// Espelham os schemas do backend de futebol (endpoints /football/*). Muitos
// campos são opcionais de propósito: a UI deve degradar com elegância quando
// o backend ainda não popular um campo. Renomear/remover campos é risco de
// contrato — confira o backend antes.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Auth (genérico — reaproveitado da base) ─────────────────────────────────
export interface AuthUser {
  id: number
  email: string
  name: string
  is_active: boolean
  /** 'user' | 'analyst' | 'admin' | 'influencer'. */
  role: string
  plan: string
  created_at: string
}

export type FootballUserRole = 'user' | 'analyst' | 'admin' | 'influencer'

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

// A lista de usuários do admin devolve o mesmo shape do AuthUser.
export type AdminUser = AuthUser

export interface AdminUserUpdate {
  plan?: string
  role?: string
  is_active?: boolean
}

// ─── Mercados ────────────────────────────────────────────────────────────────
// Identificadores de mercado em inglês (code names). Labels PT-BR ficam em
// lib/markets.ts. Mantém compat com strings livres vindas do backend.
export type FootballMarket =
  | '1x2'
  | 'double_chance'
  | 'dnb' // draw no bet
  | 'over_under'
  | 'btts' // ambas marcam
  | 'handicap'
  | 'corners'
  | 'cards'
  | 'player_goal' // jogador para marcar
  | 'player_shots'
  | 'player_shots_on_target'
  | 'player_assists'
  | string

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'canceled'
  | string

export type Confidence = 'low' | 'medium' | 'high'

// ─── Ligas / Campeonatos ─────────────────────────────────────────────────────
export interface FootballLeague {
  id: number | string
  name: string
  country: string
  logo_url?: string | null
  season?: string | null
  /** Métricas de resumo pros cards (opcionais). */
  matches_today?: number
  teams_count?: number
}

// ─── Times ───────────────────────────────────────────────────────────────────
export interface FootballTeamRef {
  id: number | string
  name: string
  short_name?: string | null
  logo_url?: string | null
}

export interface TeamFormStats {
  /** Sequência de resultados recentes, ex.: "WWDLW" (mais recente à esquerda). */
  recent_form?: string | null
  matches_played?: number
  wins?: number
  draws?: number
  losses?: number
  goals_for?: number
  goals_against?: number
  xg?: number | null
  xga?: number | null
}

export interface FootballTeam extends FootballTeamRef {
  country?: string | null
  league_id?: number | string | null
  league_name?: string | null
  stats?: TeamFormStats
  recent_matches?: MatchSummary[]
  upcoming_matches?: MatchSummary[]
}

export interface MatchSummary {
  id: number | string
  kickoff: string
  league_name?: string | null
  home: FootballTeamRef
  away: FootballTeamRef
  home_score?: number | null
  away_score?: number | null
  status?: MatchStatus
}

// ─── Jogadores ───────────────────────────────────────────────────────────────
export interface FootballPlayer {
  id: number | string
  name: string
  team?: string | null
  team_id?: number | string | null
  position?: string | null
  appearances?: number
  goals?: number
  assists?: number
  xg?: number | null
  xa?: number | null
  shots?: number
  shots_on_target?: number
  minutes?: number
  yellow_cards?: number
  red_cards?: number
  /** Status provável pro próximo jogo: ex. "available" | "doubtful" | "out". */
  status?: string | null
  // ── Parâmetros analíticos extra (api-football) ──────────────────────────
  rating?: number | null
  key_passes?: number
  passes?: number
  pass_accuracy?: number | null
  dribbles?: number
  dribbles_attempts?: number
  tackles?: number
  interceptions?: number
  duels?: number
  duels_won?: number
  fouls_drawn?: number
  fouls_committed?: number
  penalty_scored?: number
  // Índices compostos (0–100)
  ipo?: number | null
  icj?: number | null
  idef?: number | null
  iip?: number | null
}

// ─── Odds principais embutidas no card do jogo ───────────────────────────────
export interface MatchMainOdds {
  /** 1x2: casa / empate / fora. */
  home?: number | null
  draw?: number | null
  away?: number | null
  /** Over/under da linha principal de gols. */
  over?: number | null
  under?: number | null
  over_under_line?: number | null
}

// ─── Jogos ───────────────────────────────────────────────────────────────────
export interface FootballMatch {
  id: number | string
  league_id?: number | string | null
  league_name?: string | null
  country?: string | null
  season?: string | null
  /** ISO 8601 UTC. Front converte pro timezone local. */
  kickoff: string
  status: MatchStatus
  /** Minuto corrente quando ao vivo. Null fora disso. */
  minute?: number | null
  home: FootballTeamRef
  away: FootballTeamRef
  home_score?: number | null
  away_score?: number | null
  odds?: MatchMainOdds | null
  // ── Torneio (preenchido no contexto Copa do Mundo) ──────────────────────
  context?: string
  stage?: string | null
  group?: string | null
  venue?: string | null
  city?: string | null
  extra_time_home?: number | null
  extra_time_away?: number | null
  penalty_home?: number | null
  penalty_away?: number | null
  winner?: string | null
}

export interface MatchListResponse {
  date?: string
  matches: FootballMatch[]
}

// ─── Copa do Mundo: contexto, grupos, classificação, chaveamento ─────────────
export interface CompetitionInfo {
  key: string
  label: string
  active: boolean
  features: string[]
}

export interface WorldCupStanding {
  rank: number
  team: FootballTeamRef
  points: number
  played: number
  win: number
  draw: number
  lose: number
  goals_for: number
  goals_against: number
  goal_diff: number
  group?: string | null
  form?: string | null
}

export interface WorldCupGroup {
  name: string
  standings: WorldCupStanding[]
}

export interface WorldCupBracketTie {
  match_id: number
  stage: string
  home: FootballTeamRef
  away: FootballTeamRef
  home_score?: number | null
  away_score?: number | null
  penalty_home?: number | null
  penalty_away?: number | null
  winner?: string | null
  status: string
  kickoff?: string | null
}

export interface WorldCupBracketStage {
  stage: string
  label: string
  ties: WorldCupBracketTie[]
}

// ─── Estatísticas detalhadas de uma partida (tela de análise) ────────────────
export interface TeamMatchStats {
  team: FootballTeamRef
  recent_form?: string | null
  /** Split casa/fora relevante (ex.: aproveitamento como mandante). */
  home_away_form?: string | null
  goals_for?: number | null
  goals_against?: number | null
  xg?: number | null
  xga?: number | null
  shots?: number | null
  shots_on_target?: number | null
  corners?: number | null
  cards?: number | null
}

export interface MatchInjury {
  player_name: string
  team_side: 'home' | 'away'
  reason?: string | null
  status?: string | null
}

export interface LineupSlot {
  player_name: string
  position?: string | null
  number?: number | null
  is_starter?: boolean
}

export interface MatchStatistics {
  match_id: number | string
  home: TeamMatchStats
  away: TeamMatchStats
  injuries?: MatchInjury[]
  probable_lineup_home?: LineupSlot[]
  probable_lineup_away?: LineupSlot[]
  /** Recomendação do modelo pra esta partida (opcional). */
  recommendation?: FootballRecommendation | null
  /** Explicação textual da recomendação/leitura do modelo. */
  model_note?: string | null
  updated_at?: string
}

// ─── Odds (comparação entre casas) ───────────────────────────────────────────
export interface OddsEntry {
  bookmaker: string
  market: FootballMarket
  selection: string
  line?: number | null
  odd: number
  previous_odd?: number | null
  /** Variação relativa (ex.: +0.05). Pode vir calculada do backend. */
  movement?: number | null
  updated_at?: string | null
}

export interface MatchOdds {
  match_id: number | string
  entries: OddsEntry[]
}

/** Linha de mercado com prob. do modelo + valor (odd justa, edge). */
export interface MarketLine {
  market: FootballMarket
  selection: string
  line?: number | null
  model_prob: number
  fair_odd: number
  odd?: number | null
  edge?: number | null
  confidence?: number | null
}

export interface OddsBoardItem {
  match: MatchSummary
  best: OddsEntry
  entries: OddsEntry[]
}

// ─── Recomendações do modelo ─────────────────────────────────────────────────
export interface FootballRecommendation {
  id: number | string
  /** Rótulo "Mandante x Visitante". */
  match: string
  match_id?: number | string | null
  league?: string | null
  market: FootballMarket
  /** Seleção/mercado, ex.: "Casa", "Over", "BTTS Sim", "Jogador X". */
  selection: string
  line?: number | null
  odd?: number | null
  /** Odd justa estimada pelo modelo. */
  fair_odd?: number | null
  /** Probabilidade do modelo (0..1). */
  model_prob?: number | null
  /** Probabilidade implícita pela odd (0..1). */
  implied_prob?: number | null
  /** Edge (model_prob - implied_prob), 0..1. */
  edge?: number | null
  confidence?: Confidence | null | string
  status?: 'pending' | 'won' | 'lost' | 'void' | string
  /** Motivo/leitura da entrada. */
  reason?: string | null
  bookmaker?: string | null
  created_by_name?: string | null
  created_at: string
  /** Contexto + torneio. */
  context?: string
  stage?: string | null
  group?: string | null
  /** Kickoff do jogo (ISO) — agrupar/ordenar por jogo. */
  kickoff?: string | null
  /** Props de jogador: time do jogador + número da camisa. */
  team?: string | null
  player_number?: number | null
  /** Selo de destaque (ex.: "Discrepância alta"). */
  tag?: string | null
  /** Tiles do card AO VIVO de jogador (pressão, projeção, ritmo, placar...). */
  stats_used?: Record<string, number | string | null> | null
}

// ─── Recomendações AO VIVO (in-play, foco escanteios) ────────────────────────
export interface LiveReco {
  id: number
  context?: string
  match_id: number
  league?: string | null
  home_team: string
  away_team: string
  minute?: number | null
  home_score?: number | null
  away_score?: number | null
  /** corners_over | team_corners_over | next_corner | shots_on_target | goal_pressure | avoid_entry */
  type: string
  market: string
  line?: number | null
  odd?: number | null
  /** 0-10 */
  confidence: number
  recommendation: string
  reason: string
  stats_used?: Record<string, number | string> | null
  status: string
  /** pending | green | red | void */
  result: string
  created_at: string
  updated_at?: string | null
}

/** Uma linha de desempenho (total, mercado ou faixa de confiança). */
export interface PerfRow {
  won: number
  lost: number
  push: number
  void: number
  total: number
  accuracy: number
  roi: number
  profit_units: number
}
/** Breakdown de performance por mercado e por faixa de confiança (calibração). */
export interface PerformanceBreakdown {
  totals: PerfRow
  by_market: Record<string, PerfRow>
  by_confidence: Record<string, PerfRow>
  /** 'legacy_com_odds' (engine antigo, baseado em odds) vs 'atual_sem_odds' (confidence-first). */
  by_era: Record<string, PerfRow>
}

/** Recomendação da engine de análise (scores 0-100 + grade explicável). */
export interface AnalysisRecommendation {
  id: number
  match_id?: number | null
  match?: string | null
  league?: string | null
  market: string
  selection: string
  line?: number | null
  odd?: number | null
  /** 0-100 */
  confidence: number
  /** 0-100 — convicção do modelo */
  edge_score: number
  /** 0-100 — maior = mais arriscado */
  risk_score: number
  recommendation_type: 'PRE_GAME' | 'LIVE'
  grade: 'A+' | 'A' | 'B' | 'C' | 'AVOID'
  reasons: string[]
  warnings: string[]
  /** scores do jogo (0-100), None quando não se aplica */
  raw_scores: Record<string, number | null>
  team?: string | null
  context?: string
  stage?: string | null
  group?: string | null
  kickoff?: string | null
}

// ─── Entradas ao vivo (publicadas por analistas) ─────────────────────────────
export interface FootballLivePick {
  id: number | string
  match: string
  match_id?: number | string | null
  league?: string | null
  market: FootballMarket
  selection: string
  line?: number | null
  odd?: number | null
  confidence?: Confidence | null | string
  reason?: string | null
  status: 'active' | 'won' | 'lost' | 'void' | 'cancelled' | string
  analyst_name?: string | null
  created_at: string
  settled_at?: string | null
}

export interface FootballLivePickCreate {
  match: string
  match_id?: number | string | null
  league?: string | null
  market: FootballMarket
  selection: string
  line?: number | null
  odd?: number | null
  confidence?: Confidence | null
  reason?: string
}

export interface FootballLivePickUpdate {
  status?: FootballLivePick['status']
  odd?: number | null
  confidence?: Confidence | null
  reason?: string
}

// ─── Resultados de picks / performance ───────────────────────────────────────
export type PickResultStatus = 'win' | 'loss' | 'push' | 'pending' | string

export interface FootballPickResult {
  id: number | string
  match: string
  league?: string | null
  market: FootballMarket
  selection: string
  odd?: number | null
  result: PickResultStatus
  /** Lucro/prejuízo simulado em unidades (ex.: +0.85, -1.0). */
  profit?: number | null
  analyst_name?: string | null
  created_at: string
  settled_at?: string | null
}

export interface PerfBucket {
  won: number
  lost: number
  push?: number
  pending?: number
  total: number
  /** 0..1 (ou null quando sem amostra liquidada). */
  hit_rate: number | null
  roi?: number | null
  profit?: number | null
}

export interface PerfBreakdownItem extends PerfBucket {
  /** Rótulo da dimensão (mercado, liga ou analista). */
  key: string
  label?: string
}

export interface PerfTimelinePoint {
  /** Rótulo do período (data, semana ou mês). */
  period: string
  profit: number
  cumulative_profit?: number
  picks?: number
  hit_rate?: number | null
}

export interface FootballPerformanceSummary {
  totals: {
    total: number
    won: number
    lost: number
    push: number
    pending: number
    hit_rate: number | null
    roi: number | null
    profit: number | null
  }
  by_market: PerfBreakdownItem[]
  by_league: PerfBreakdownItem[]
  by_analyst?: PerfBreakdownItem[]
  timeline?: PerfTimelinePoint[]
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardSummary {
  todays_matches: FootballMatch[]
  best_recommendations: FootballRecommendation[]
  performance: FootballPerformanceSummary['totals']
  pending_picks: number
  settled_picks: number
  featured_leagues: FootballLeague[]
}
