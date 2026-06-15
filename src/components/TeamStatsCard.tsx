import type { FootballTeam, TeamMatchStats } from '../types'
import TeamBadge from './TeamBadge'
import FormString from './FormString'

// ─── Card de estatísticas de um time ─────────────────────────────────────────
// Aceita tanto FootballTeam (catálogo /times) quanto TeamMatchStats (tela de
// análise do jogo). Mostra forma recente, gols marcados/sofridos, xG/xGA.

interface UnifiedStats {
  name: string
  logo_url?: string | null
  short_name?: string | null
  id?: number | string
  recent_form?: string | null
  goals_for?: number | null
  goals_against?: number | null
  xg?: number | null
  xga?: number | null
  subtitle?: string | null
}

function fromTeam(t: FootballTeam): UnifiedStats {
  return {
    name: t.name,
    logo_url: t.logo_url,
    short_name: t.short_name,
    id: t.id,
    recent_form: t.stats?.recent_form,
    goals_for: t.stats?.goals_for,
    goals_against: t.stats?.goals_against,
    xg: t.stats?.xg,
    xga: t.stats?.xga,
    subtitle: t.league_name ?? t.country,
  }
}

function fromMatchStats(s: TeamMatchStats): UnifiedStats {
  return {
    name: s.team.name,
    logo_url: s.team.logo_url,
    short_name: s.team.short_name,
    id: s.team.id,
    recent_form: s.recent_form,
    goals_for: s.goals_for,
    goals_against: s.goals_against,
    xg: s.xg,
    xga: s.xga,
    subtitle: s.home_away_form,
  }
}

function num(v?: number | null, digits = 0): string {
  return v == null ? '—' : v.toFixed(digits)
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-2 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{label}</div>
      <div className="text-[15px] font-extrabold tabular text-zinc-100">{value}</div>
    </div>
  )
}

export default function TeamStatsCard(
  props: { team: FootballTeam; stats?: never } | { stats: TeamMatchStats; team?: never },
) {
  const s: UnifiedStats = 'team' in props && props.team ? fromTeam(props.team) : fromMatchStats(props.stats!)

  return (
    <div className="card-premium p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <TeamBadge team={{ id: s.id ?? s.name, name: s.name, short_name: s.short_name, logo_url: s.logo_url }} size="lg" />
        <div className="min-w-0">
          <div className="text-[15px] font-extrabold text-white truncate">{s.name}</div>
          {s.subtitle && <div className="text-[11px] text-zinc-500 truncate">{s.subtitle}</div>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Forma</span>
        <FormString form={s.recent_form} />
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <Metric label="Gols pró" value={num(s.goals_for)} />
        <Metric label="Gols contra" value={num(s.goals_against)} />
        <Metric label="xG" value={num(s.xg, 2)} />
        <Metric label="xGA" value={num(s.xga, 2)} />
      </div>
    </div>
  )
}
