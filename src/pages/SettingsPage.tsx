// ─── SettingsPage — conta e preferências ─────────────────────────────────────
// Dados da conta, tema (dark fixo por enquanto), logout. Plano/assinatura
// ficam como "em breve". Não há endpoint de update de perfil no contrato
// atual — campos são informativos.

import { useAuth } from '../auth/AuthContext'
import { ROLE_LABELS } from '../auth/permissions'
import { toDisplayName } from '../lib/format'
import { SectionCard } from '../components/dashboard/parts'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.05] last:border-b-0">
      <span className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="text-[13px] text-zinc-200 font-semibold truncate">{value}</span>
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <SectionCard title="Dados da conta" icon="👤">
        {user ? (
          <div>
            <Row label="Nome" value={toDisplayName(user.name || user.email.split('@')[0])} />
            <Row label="Email" value={user.email} />
            <Row label="Perfil" value={ROLE_LABELS[user.role] ?? user.role} />
            <Row label="Plano" value={user.plan} />
            <Row label="Membro desde" value={new Date(user.created_at).toLocaleDateString('pt-BR')} />
          </div>
        ) : (
          <p className="text-[13px] text-zinc-500">Sessão não encontrada.</p>
        )}
      </SectionCard>

      <SectionCard title="Preferências" icon="🎨">
        <div>
          <Row label="Tema" value="Escuro (padrão)" />
          <Row label="Idioma" value="Português (BR)" />
        </div>
        <p className="mt-3 text-[12px] text-zinc-600">
          Personalização de tema e plano/assinatura chegam em breve.
        </p>
      </SectionCard>

      <button
        onClick={logout}
        className="w-full rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 font-bold text-sm py-2.5 transition-colors"
      >
        Sair da conta
      </button>
    </div>
  )
}
