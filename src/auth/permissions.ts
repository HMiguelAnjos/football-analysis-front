// ─── Permissões por role ──────────────────────────────────────────────────────
// Estrutura CENTRAL e fácil de expandir. Pra adicionar uma permissão nova:
// declare no tipo Permission e some-a ao(s) role(s) em ROLE_PERMISSIONS — o
// menu (Sidebar) e as rotas (PermissionRoute em App.tsx) passam a respeitar.
// NÃO espalhar `role === 'admin'` solto pelo código — sempre via can().
//
// Deve espelhar o backend de futebol (manter os dois em sincronia).

import type { AuthUser } from '../types'

// publishPicks         : publicar/gerenciar entradas ao vivo (analista + admin)
// viewUsers            : área administrativa de usuários (admin)
// viewGlobalPerformance: performance global + por analista (admin)
export type Permission = 'publishPicks' | 'viewUsers' | 'viewGlobalPerformance'

// admin      : acesso total
// analyst    : publica entradas ao vivo
// influencer : SEM admin (igual user), com acesso premium de cortesia
// user       : usuário comum (só visualiza)
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['publishPicks', 'viewUsers', 'viewGlobalPerformance'],
  analyst: ['publishPicks'],
  influencer: [],
  user: [],
}

export function can(user: AuthUser | null | undefined, permission: Permission): boolean {
  if (!user) return false
  return (ROLE_PERMISSIONS[user.role] ?? []).includes(permission)
}

// Roles com acesso premium de cortesia (sem plano pago) — espelha o backend.
const COURTESY_PREMIUM_ROLES = ['admin', 'analyst', 'influencer']

// True se o usuário enxerga o conteúdo PREMIUM/top — por plano pago ou por
// cortesia de role. Hook central pro futuro gating por plano/assinatura.
export function hasPremiumAccess(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  return COURTESY_PREMIUM_ROLES.includes(user.role) || user.plan === 'premium'
}

// ── Roles atribuíveis (pra UI de gestão de usuários) ──────────────────────────
export const ROLES = ['user', 'influencer', 'analyst', 'admin'] as const
export type Role = (typeof ROLES)[number]
export const ROLE_LABELS: Record<string, string> = {
  user: 'Usuário',
  influencer: 'Influencer',
  analyst: 'Analista',
  admin: 'Admin',
}
