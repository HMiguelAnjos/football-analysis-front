/** @type {import('tailwindcss').Config} */
// ─── ClutchPro Design Tokens ──────────────────────────────────────────────────
// Paleta calibrada com o logo:
//   White → Clutch (texto principal)
//   Orange → Pro (accent, brand primária pra CTA/nav/highlight)
//   Green (emerald, via Tailwind direto) → OVER/edge positivo (semântica de lucro)
//   Gold/amber (amber direto) → premium accents pontuais (linhas, badges)
//
// `brand` agora é a família ORANGE — qualquer `bg-brand-500` no app vira
// laranja automaticamente (botões primários, link ativo, focus ring, etc.).
// Cores de decisão (emerald/red) ficam EXPLÍCITAS nos componentes pra nunca
// se misturar com o brand.

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand book ClutchPro (mai/2026) ──────────────────────────
        // Laranja primária #FF6A00 (mais forte/saturada que o antigo
        // #f97316). Escala calibrada pra contraste em dark #111.
        brand: {
          50:  '#fff3e8',
          100: '#ffe1c7',
          200: '#ffc596',
          300: '#ffa563',
          400: '#ff8a3d',  // hover/active text
          500: '#ff6a00',  // brand primário (CTA, nav ativo, focus ring)
          600: '#e25c00',  // hover/pressed
          700: '#b84a00',
          800: '#8f3a00',
          900: '#6b2c00',
          950: '#3d1900',
        },
        // Verde de performance #22C55E (= edge positivo / OVER / lucro).
        accent: {
          400: '#4ade80',
          500: '#22c55e',  // verde do brand book
          600: '#16a34a',
          700: '#15803d',
        },
        // Superfícies dark do brand book (#111111 / #2A2A2A). Usado na
        // nova casca (sidebar/topbar/cards). Páginas legadas ainda usam
        // slate — coexistem bem no fundo #111.
        ink: {
          950: '#0a0a0a',
          900: '#0f0f0f',
          850: '#141414',
          800: '#191919',  // sidebar / topbar surface
          700: '#1f1f1f',  // card surface
          600: '#262626',
          500: '#2a2a2a',  // borda / divisória
        },
      },
      fontFamily: {
        sans: ['Raleway', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Sombras "premium" — glow LARANJA #FF6A00 (brand book).
      boxShadow: {
        'soft':   '0 1px 2px 0 rgb(0 0 0 / 0.40), 0 1px 3px 0 rgb(0 0 0 / 0.25)',
        'raised': '0 4px 12px -2px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.35)',
        'glow':   '0 0 0 1px rgb(255 106 0 / 0.35), 0 0 24px -4px rgb(255 106 0 / 0.30)',
      },
      animation: {
        'fade-in':       'fadeIn 200ms ease-out',
        'pulse-subtle':  'pulseSubtle 2s ease-in-out infinite',
        'shimmer':       'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        pulseSubtle:  { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
