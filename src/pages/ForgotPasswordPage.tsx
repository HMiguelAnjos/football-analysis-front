// ─── ForgotPasswordPage ─────────────────────────────────────────────────────
// Etapa 1 da recuperação: o usuário digita o email; se houver conta,
// um link de reset é enviado. Resposta é SEMPRE a mesma (anti-enumeração).

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      // O backend devolve 200 mesmo quando email não existe; só caímos
      // aqui se a rede falhar ou validação rejeitar. Mostra mensagem
      // amigável sem expor detalhe interno.
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Não foi possível enviar o email. Tenta de novo em instantes.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img
            src="/clutchpro-symbol.png"
            alt=""
            className="h-9 w-auto object-contain"
          />
          <div
            className="text-[22px] font-extrabold tracking-[-0.02em] leading-none"
            style={{ fontFamily: 'var(--font-display, inherit)' }}
          >
            <span className="text-white">Clutch</span>
            <span className="text-brand-500">Pro</span>
          </div>
        </div>

        <div className="card-premium p-6">
          <h1 className="text-white font-bold text-lg tracking-tight">
            Recuperar senha
          </h1>
          <p className="text-zinc-500 text-[13px] mt-1 mb-5">
            Te mandamos um link pra você criar uma nova senha.
          </p>

          {sent ? (
            <div className="text-zinc-300 text-[13px] leading-relaxed">
              <p>
                Se houver uma conta com{' '}
                <span className="text-white font-semibold">{email}</span>, um
                email com o link de recuperação está a caminho.
              </p>
              <p className="mt-2 text-zinc-500">
                Não esquece de checar a caixa de spam. O link expira em 1 hora.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-5 w-full h-10 rounded-lg bg-brand-500 hover:bg-brand-600 text-ink-900 font-bold text-[13px] transition-colors"
              >
                Voltar pro login
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-ink-850 border border-white/[0.06] text-white text-[13px] focus:outline-none focus:border-brand-500/60 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              {error && (
                <p className="text-[12px] text-red-400 leading-snug">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full h-10 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-ink-900 font-bold text-[13px] transition-colors"
              >
                {submitting ? 'Enviando…' : 'Enviar link de recuperação'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-[12px] text-zinc-500">
            Lembrou a senha?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-brand-300 font-semibold hover:text-brand-200"
            >
              Entrar
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-4">
          ClutchPro · análise não é recomendação de aposta.
        </p>
      </div>
    </div>
  )
}
