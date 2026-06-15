import { useLocation } from 'react-router-dom'

// ─── ClutchPro Football Topbar (minimalista premium) ─────────────────────────
// Sem navegação primária (isso é a Sidebar). Esquerda: contexto da seção atual.
// Direita: slot da página (KPIs/ações via portal #topbar-slot). Hambúrguer só
// no mobile.

const SECTION: { match: (p: string) => boolean; title: string; sub: string }[] = [
  { match: p => p === '/', title: 'Dashboard', sub: 'Visão geral da operação' },
  { match: p => /^\/jogos\/[^/]+/.test(p), title: 'Análise do Jogo', sub: 'Estatísticas, forma e leitura do modelo' },
  { match: p => p.startsWith('/jogos'), title: 'Jogos', sub: 'Partidas do dia e calendário' },
  { match: p => p.startsWith('/recomendacoes'), title: 'Recomendações', sub: 'Entradas geradas pelo modelo' },
  { match: p => p.startsWith('/entradas'), title: 'Entradas ao Vivo', sub: 'Publicadas pelos analistas em tempo real' },
  { match: p => p.startsWith('/performance'), title: 'Performance', sub: 'Acompanhamento de resultados' },
  { match: p => p.startsWith('/grupos'), title: 'Grupos', sub: 'Fase de grupos e classificação' },
  { match: p => p.startsWith('/mata-mata'), title: 'Mata-mata', sub: 'Chaveamento do torneio' },
  { match: p => p.startsWith('/ligas'), title: 'Ligas', sub: 'Campeonatos cobertos' },
  { match: p => p.startsWith('/times'), title: 'Times', sub: 'Forma e estatísticas por time' },
  { match: p => p.startsWith('/jogadores'), title: 'Jogadores', sub: 'Busca e estatísticas individuais' },
  { match: p => p.startsWith('/odds'), title: 'Odds', sub: 'Comparação entre casas' },
  { match: p => p.startsWith('/publicar'), title: 'Publicar Entrada', sub: 'Área de analista' },
  { match: p => p.startsWith('/usuarios'), title: 'Usuários', sub: 'Gestão de acessos' },
  { match: p => p.startsWith('/config'), title: 'Configurações', sub: 'Conta e preferências' },
]

function ctx(path: string) {
  return (
    SECTION.find(s => s.match(path)) ?? {
      title: 'ClutchPro Football',
      sub: 'Inteligência de futebol em tempo real',
    }
  )
}

export default function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation()
  const { title, sub } = ctx(pathname)

  return (
    <header
      className="sticky top-0 z-30
                 bg-gradient-to-b from-ink-850/90 to-ink-900/70 backdrop-blur-xl
                 border-b border-white/[0.06]
                 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]
                 pt-[env(safe-area-inset-top)]"
    >
      <div className="h-16 flex items-center gap-4 px-5 sm:px-8
                      pl-[max(1.25rem,env(safe-area-inset-left))]
                      pr-[max(1.25rem,env(safe-area-inset-right))]">
        {/* Hambúrguer — mobile */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg
                     text-zinc-300 hover:text-white hover:bg-white/[0.06]
                     transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
          </svg>
        </button>

        {/* Contexto da seção */}
        <div className="flex items-center gap-3 min-w-0">
          <span aria-hidden className="hidden sm:block w-1 h-7 rounded-full bg-brand-500" />
          <div className="min-w-0 leading-none">
            <h1
              className="text-white font-extrabold text-[17px] tracking-tight truncate"
              style={{ fontFamily: 'var(--font-display, inherit)' }}
            >
              {title}
            </h1>
            <p className="hidden sm:block mt-1 text-[11px] text-zinc-500 truncate">
              {sub}
            </p>
          </div>
        </div>

        {/* Lado direito: slot da página (KPIs/ações via portal). */}
        <div className="ml-auto flex items-center gap-3 min-w-0">
          <div
            id="topbar-slot"
            className="flex items-center gap-2 min-w-0 overflow-x-auto"
          />
        </div>
      </div>
    </header>
  )
}
