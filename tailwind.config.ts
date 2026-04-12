import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'studio-bg':      '#0d0a07',
        'studio-surface': '#1c1610',
        'studio-rim':     '#2a1f12',
        'studio-primary': '#c8922a',
        'studio-gold':    '#e8b84b',
        'studio-cream':   '#f5ead6',
        'studio-text':    '#c9b99a',
        'studio-muted':   '#7a6a52',
        'studio-rose':    '#c0614a',
      },
      boxShadow: {
        'studio-glow':    '0 0 0 1px rgba(200,146,42,0.15), 0 4px 24px rgba(200,146,42,0.18)',
        'studio-glow-lg': '0 0 0 1px rgba(200,146,42,0.25), 0 8px 40px rgba(200,146,42,0.30)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '450ms',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease both',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
}

export default config
