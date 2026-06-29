// ─── AuthPage (feature/login-area) ───────────────────────────────────────────
// Tela única de login/registro (auto-cadastro aberto). Visual premium
// ClutchPro. Em sucesso, o AuthProvider já tem a sessão → App mostra o app.

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const isRegister = mode === 'register'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isRegister) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail
      setError(
        detail ||
          (isRegister
            ? 'Não foi possível criar a conta.'
            : 'Email ou senha incorretos.'),
      )
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
            className="h-14 w-auto object-contain"
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
            {isRegister ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="text-zinc-500 text-[13px] mt-1 mb-5">
            {isRegister
              ? 'Crie sua conta pra acessar o ClutchPro.'
              : 'Acesse sua conta ClutchPro.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            {isRegister && (
              <Field
                label="Nome"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Seu nome"
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="voce@email.com"
              autoComplete="email"
              required
            />
            <Field
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />

            {error && (
              <div className="text-[12px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-1 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm py-2.5 transition-colors"
            >
              {submitting
                ? 'Aguarde…'
                : isRegister
                  ? 'Criar conta'
                  : 'Entrar'}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <div className="mt-4 text-center text-[12px] text-zinc-500">
            {isRegister ? (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-brand-300 font-semibold hover:text-brand-200"
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Não tem conta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-brand-300 font-semibold hover:text-brand-200"
                >
                  Criar conta
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-4">
          ClutchPro — Análise · Edge · Decisão
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="mt-1 w-full rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/25 text-zinc-100 text-sm px-3 py-2.5 transition-colors placeholder:text-zinc-600"
      />
    </label>
  )
}
