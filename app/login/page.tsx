'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'
import MusicBackground from '@/components/motifs/MusicBackground'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(email, password)

    if (result.success) {
      // Full page reload required — router.push() does client-side nav which
      // skips the server re-reading the new session cookie, causing stale views.
      window.location.href = '/dashboard'
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-studio-bg overflow-hidden" style={{ zIndex: 1 }}>
      <MusicBackground />

      <div className="relative z-10 w-full max-w-sm bg-studio-surface shadow-studio-glow rounded-2xl p-8">
        <h1 className="font-display text-5xl text-studio-cream tracking-wide mb-2">
          Coda
        </h1>
        <p className="text-studio-muted text-lg mb-6">Lessons organized, progress in crescendo.</p>

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
      </div>
    </main>
  )
}
