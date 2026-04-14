'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { getDemoCredentials, demoEnabled, DEMO_STUDENT_ID } from '@/lib/demo'
import MusicBackground from '@/components/motifs/MusicBackground'

const FEATURES = [
  { icon: '🎵', label: 'Track repertoire progress' },
  { icon: '📝', label: 'Log lesson notes' },
  { icon: '🎓', label: 'Assign practice tasks' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<'teacher' | 'student' | null>(null)
  const [demoError, setDemoError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(email, password)

    if (result.success) {
      window.location.href = '/dashboard'
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleDemoSignIn(role: 'teacher' | 'student') {
    const creds = getDemoCredentials(role)
    if (!creds) return

    setDemoError(null)
    setDemoLoading(role)

    const result = await signIn(creds.email, creds.password)

    if (result.success) {
      window.location.href = role === 'teacher'
        ? '/dashboard'
        : `/progress/${DEMO_STUDENT_ID}`
    } else {
      setDemoError('Demo is temporarily unavailable. Please try again later.')
      setDemoLoading(null)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-studio-bg overflow-hidden" style={{ zIndex: 1 }}>
      <MusicBackground />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="bg-studio-surface shadow-studio-glow rounded-2xl p-8">
          <h1 className="font-display text-5xl text-studio-cream tracking-wide mb-1">
            Coda
          </h1>
          <p className="text-studio-muted text-sm mb-6">Lessons organized, progress in crescendo.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-studio-cream mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="studio-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-studio-cream mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="studio-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-studio-rose" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="studio-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {demoEnabled && (
            <div className="mt-6">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-studio-rim" />
                </div>
                <span className="relative bg-studio-surface px-3 text-xs text-studio-muted uppercase tracking-wider">
                  Try a live demo
                </span>
              </div>

              {/* Feature highlights */}
              <div className="flex justify-center gap-4 mb-4">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-1 text-center">
                    <span className="text-xl" aria-hidden="true">{f.icon}</span>
                    <span className="text-xs text-studio-muted leading-tight max-w-[60px]">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Demo buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => handleDemoSignIn('teacher')}
                  className="flex-1 flex flex-col items-center gap-0.5 border border-studio-primary/50 text-studio-primary rounded-xl px-3 py-3 hover:bg-studio-primary/10 hover:border-studio-primary transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg" aria-hidden="true">👩‍🏫</span>
                  <span className="text-xs font-semibold">
                    {demoLoading === 'teacher' ? 'Loading…' : 'Teacher view'}
                  </span>
                  <span className="text-[10px] text-studio-muted">Manage students</span>
                </button>
                <button
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => handleDemoSignIn('student')}
                  className="flex-1 flex flex-col items-center gap-0.5 border border-studio-gold/50 text-studio-gold rounded-xl px-3 py-3 hover:bg-studio-gold/10 hover:border-studio-gold transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg" aria-hidden="true">🎓</span>
                  <span className="text-xs font-semibold">
                    {demoLoading === 'student' ? 'Loading…' : 'Student view'}
                  </span>
                  <span className="text-[10px] text-studio-muted">See your progress</span>
                </button>
              </div>

              {demoError && (
                <p className="mt-3 text-sm text-studio-rose text-center" role="alert">
                  {demoError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
