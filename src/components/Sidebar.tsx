import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { can, type Permission } from '../auth/permissions'
import { toDisplayName } from '../lib/format'
import { useCompetition } from '../hooks/useCompetition'
import CompetitionToggle from './CompetitionToggle'

// ─── ClutchPro Football Sidebar (premium dark) ───────────────────────────────
// Rail vertical à esquerda. Desktop (≥ lg): fixa, 208px. Mobile (< lg): drawer.
// Itens administrativos (Publicar Entrada / Usuários) aparecem conforme a
// permissão do role. Proteção real é server-side; aqui é só visibilidade.

interface NavItem {
  to: string
  label: string
  end?: boolean
  icon: React.ReactNode
}

const ic = (path: React.ReactNode) => (
  <svg
    width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden
  >
    {path}
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  {
    to: '/', label: 'Dashboard', end: true,
    icon: ic(<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  },
  {
    to: '/jogos', label: 'Jogos',
    icon: ic(<><circle cx="12" cy="12" r="9" /><path d="m12 7 2.5 1.8-1 3h-3l-1-3L12 7Z" /></>),
  },
  {
    to: '/recomendacoes', label: 'Pré-Jogo',
    icon: ic(<><path d="m13 2-3 7h5l-3 7" /><circle cx="12" cy="12" r="9" opacity="0.3" /></>),
  },
  {
    to: '/ao-vivo', label: 'Ao Vivo',
    icon: ic(<><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" opacity="0.6" /></>),
  },
  {
    to: '/jogadores', label: 'Jogadores',
    icon: ic(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" opacity="0.5" /></>),
  },
  {
    to: '/config', label: 'Configurações',
    icon: ic(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 7.5 19.4l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 13.6a1.65 1.65 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 7.5" opacity="0.6" /></>),
  },
]

// Menu do modo Copa do Mundo — reusa as MESMAS rotas/telas (que trocam de
// dados pelo contexto) + telas exclusivas (Grupos, Mata-mata). Esconde o que
// não faz sentido no torneio (Ligas/Jogadores/Odds).
const WC_NAV_ITEMS: NavItem[] = [
  {
    to: '/', label: 'Visão Geral', end: true,
    icon: ic(<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  },
  {
    to: '/jogos', label: 'Jogos',
    icon: ic(<><circle cx="12" cy="12" r="9" /><path d="m12 7 2.5 1.8-1 3h-3l-1-3L12 7Z" /></>),
  },
  {
    to: '/recomendacoes', label: 'Pré-Jogo',
    icon: ic(<><path d="m13 2-3 7h5l-3 7" /><circle cx="12" cy="12" r="9" opacity="0.3" /></>),
  },
  {
    to: '/ao-vivo', label: 'Ao Vivo',
    icon: ic(<><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" opacity="0.6" /></>),
  },
  {
    to: '/jogadores', label: 'Jogadores',
    icon: ic(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" opacity="0.5" /></>),
  },
]

// Itens administrativos — cada um exige uma PERMISSÃO. Renderizados conforme o
// role: Publicar Entrada pra analista+admin, Usuários só pra admin.
const ADMIN_NAV_ITEMS: (NavItem & { permission: Permission })[] = [
  {
    to: '/resultados-ao-vivo', label: 'Resultados ao Vivo', permission: 'publishPicks',
    icon: ic(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  },
  {
    to: '/usuarios', label: 'Usuários', permission: 'viewUsers',
    icon: ic(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 3.5a3 3 0 0 1 0 5.8M21 20a6 6 0 0 0-3.5-5.5" opacity="0.55" /></>),
  },
]

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-2.5 pl-3 pr-2.5 h-9 rounded-lg',
          'text-[13px] font-semibold tracking-tight',
          'transition-all duration-200',
          isActive
            ? 'text-white bg-white/[0.06] border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
            : 'text-zinc-400 border border-transparent hover:text-white hover:bg-white/[0.035]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-brand-500 transition-opacity duration-200 ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <span
            className={`transition-colors ${
              isActive ? 'text-brand-400' : 'text-zinc-500 group-hover:text-zinc-200'
            }`}
          >
            {item.icon}
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isWorldCup } = useCompetition()
  const navItems = isWorldCup ? WC_NAV_ITEMS : NAV_ITEMS
  // Itens admin que ESTE usuário pode ver, por permissão.
  const adminItems = ADMIN_NAV_ITEMS.filter(item => can(user, item.permission))
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={[
          'fixed z-50 inset-y-0 left-0 w-[208px] flex flex-col',
          'pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)]',
          'bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950',
          'border-r border-white/[0.06]',
          'shadow-[1px_0_0_0_rgba(255,255,255,0.03),8px_0_24px_-12px_rgba(0,0,0,0.6)]',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        ].join(' ')}
      >
        {/* ── Logo ── */}
        <NavLink
          to="/"
          className="group flex items-center gap-2.5 px-4 pt-5 pb-4"
          aria-label="ClutchPro Football"
        >
          <img
            src="/clutchpro-symbol.png"
            alt=""
            className="h-9 w-auto object-contain shrink-0
                       transition-transform duration-200 group-hover:scale-[1.05]"
          />
          <div
            className="text-[18px] font-extrabold tracking-[-0.02em] leading-none"
            style={{ fontFamily: 'var(--font-display, inherit)' }}
          >
            <span className="text-white">Clutch</span>
            <span className="text-brand-500">Pro</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500 mt-1">
              Football
            </span>
          </div>
        </NavLink>

        <div className="mx-4 h-px bg-white/[0.06]" />

        {/* ── Toggle Futebol / Copa do Mundo ── */}
        <div className="px-3 pt-3">
          <CompetitionToggle />
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-2.5 py-4">
          <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600">
            {isWorldCup ? 'Copa do Mundo' : 'Menu'}
          </p>
          {navItems.map(item => (
            <NavItemLink key={item.to} item={item} onNavigate={onClose} />
          ))}

          {adminItems.length > 0 && (
            <>
              <p className="px-3 pt-4 pb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                Área de analista
              </p>
              {adminItems.map(item => (
                <NavItemLink key={item.to} item={item} onNavigate={onClose} />
              ))}
            </>
          )}
        </nav>

        {/* ── Rodapé ── */}
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/[0.05] space-y-3">
          {user && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid place-items-center w-7 h-7 rounded-full bg-brand-500/15 text-brand-300 text-[11px] font-bold shrink-0">
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-zinc-200 font-semibold truncate">
                  {toDisplayName(user.name || user.email.split('@')[0])}
                </p>
                <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sair"
                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-red-300 transition-colors"
              >
                Sair
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500/70" />
            <span>Sistema operacional · tempo real</span>
          </div>
        </div>
      </aside>
    </>
  )
}
