import { useState, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardPage from './pages/DashboardPage'
import MatchesPage from './pages/MatchesPage'
import MatchAnalysisPage from './pages/MatchAnalysisPage'
import RecommendationsPage from './pages/RecommendationsPage'
import LivePage from './pages/LivePage'
import LiveResultsAdminPage from './pages/LiveResultsAdminPage'
import LivePicksPage from './pages/LivePicksPage'
import PublishPickPage from './pages/PublishPickPage'
import LeaguesPage from './pages/LeaguesPage'
import TeamsPage from './pages/TeamsPage'
import PlayersPage from './pages/PlayersPage'
import OddsPage from './pages/OddsPage'
import SettingsPage from './pages/SettingsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AuthPage from './pages/AuthPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { can, type Permission } from './auth/permissions'
import { useCompetition } from './hooks/useCompetition'

// Guard de rota por PERMISSÃO: a tela só renderiza se o role do usuário tiver
// a permissão. A proteção REAL é server-side (backend devolve 403); este gate
// é só UX — esconde a tela e redireciona pro Dashboard. Centralizado em
// auth/permissions.ts.
function PermissionRoute({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { user } = useAuth()
  return can(user, permission) ? <>{children}</> : <Navigate to="/" replace />
}

// Shell autenticado (sidebar + topbar + rotas do produto).
function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Trocar de contexto (Futebol ↔ Copa) remonta as telas → re-fetch dos dados
  // do contexto certo, sem precisar tratar contexto em cada página.
  const { context } = useCompetition()

  return (
    <div className="min-h-screen bg-ink-900 text-zinc-100">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Conteúdo deslocado pela largura da sidebar no desktop (208px) */}
      <div className="lg:pl-[208px]">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="pb-[max(3rem,env(safe-area-inset-bottom))]">
          <Routes key={context}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jogos" element={<MatchesPage />} />
            <Route path="/jogos/:id" element={<MatchAnalysisPage />} />
            <Route path="/recomendacoes" element={<RecommendationsPage />} />
            <Route path="/props" element={<Navigate to="/recomendacoes" replace />} />
            <Route path="/ao-vivo" element={<LivePage />} />
            <Route path="/chutes" element={<Navigate to="/ao-vivo" replace />} />
            <Route path="/entradas" element={<LivePicksPage />} />
            <Route path="/performance" element={<Navigate to="/" replace />} />
            <Route path="/ligas" element={<LeaguesPage />} />
            <Route path="/times" element={<TeamsPage />} />
            <Route path="/jogadores" element={<PlayersPage />} />
            <Route path="/odds" element={<OddsPage />} />
            {/* Telas institucionais aposentadas → redireciona pro foco em aposta */}
            <Route path="/grupos" element={<Navigate to="/" replace />} />
            <Route path="/mata-mata" element={<Navigate to="/" replace />} />
            <Route path="/config" element={<SettingsPage />} />

            {/* Área de analista/admin — gate por permissão (+ 403 no back). */}
            <Route
              path="/publicar"
              element={
                <PermissionRoute permission="publishPicks">
                  <PublishPickPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/resultados-ao-vivo"
              element={
                <PermissionRoute permission="publishPicks">
                  <LiveResultsAdminPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <PermissionRoute permission="viewUsers">
                  <AdminUsersPage />
                </PermissionRoute>
              }
            />

            {/* Compat: rotas antigas (NBA) → equivalentes/dashboard. */}
            <Route path="/picks" element={<Navigate to="/recomendacoes" replace />} />
            <Route path="/recomendar" element={<Navigate to="/publicar" replace />} />
            <Route path="/admin" element={<Navigate to="/usuarios" replace />} />
            <Route path="/live" element={<Navigate to="/ao-vivo" replace />} />

            {/* Logado tentando rotas públicas de auth → manda pro app. */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/" replace />} />
            <Route path="/reset-password" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// Decide entre área pública (login/registro/recuperar) e o app, conforme a sessão.
function Gate() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/clutchpro-symbol.png" alt="" className="h-16 w-auto opacity-90" />
          <div className="skeleton h-2 w-24 rounded-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <AppShell />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  )
}
