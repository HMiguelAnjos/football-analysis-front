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
        // ── Identidade Football (jun/2026) ───────────────────────────
        // VERDE primário (escudo do logo) — qualquer `bg-brand-500` vira
        // verde (CTA, nav ativo, focus ring). Escala calibrada pra dark #111.
        brand: {
          50:  '#e9fcec',
          100: '#c7f7d0',
          200: '#90eea3',
          300: '#52df73',
          400: '#2ecb53',  // hover/active text
          500: '#16a92f',  // brand primário (verde grama do logo)
          600: '#108a26',  // hover/pressed
          700: '#0d6d1f',
          800: '#0b5519',
          900: '#073c12',
          950: '#03200a',
        },
        // DOURADO/amarelo da seta do logo — destaques premium (valor forte,
        // badges, linhas). Substitui o âmbar antigo.
        accent: {
          400: '#ffcb3d',
          500: '#f5b000',  // dourado da seta
          600: '#d99400',
          700: '#a86f00',
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
      // Sombras "premium" — glow VERDE (escudo do logo).
      boxShadow: {
        'soft':   '0 1px 2px 0 rgb(0 0 0 / 0.40), 0 1px 3px 0 rgb(0 0 0 / 0.25)',
        'raised': '0 4px 12px -2px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.35)',
        'glow':   '0 0 0 1px rgb(22 169 47 / 0.35), 0 0 24px -4px rgb(22 169 47 / 0.30)',
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
