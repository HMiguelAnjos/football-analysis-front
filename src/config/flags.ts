// ─── Feature flags de desenvolvimento ────────────────────────────────────────
// Centraliza chaves temporárias. Reverter = trocar o valor (ou apagar o uso).

/**
 * Desabilita a autenticação. Quando true:
 *   - o app abre direto (sem tela de login)
 *   - um usuário "dev" (role admin) é injetado pra liberar todas as telas
 *   - o redirect automático de 401 → /login fica desligado
 *
 * Para REATIVAR o login: troque para `false`.
 */
export const AUTH_DISABLED = true
