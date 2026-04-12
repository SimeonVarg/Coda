'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

interface NavBarProps {
  role?: 'teacher' | 'student' | null
}

export default function NavBar({ role }: NavBarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const linkClass = (href: string) =>
    `text-sm transition-colors duration-[150ms] ${
      pathname === href
        ? 'border-b-2 border-studio-gold text-studio-gold font-semibold'
        : 'text-studio-text hover:text-studio-gold'
    }`

  return (
    <nav className="bg-studio-bg border-b border-studio-primary/30 px-6 py-3 flex items-center justify-between relative overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Coda logo" className="w-7 h-7 select-none" aria-hidden="true" />
        <Link href="/dashboard" className="font-display text-xl text-studio-cream hover:text-studio-gold transition-colors duration-[150ms]">
          Coda
        </Link>
        {role && (
          <span className="rounded-full bg-studio-surface border border-studio-gold/30 px-2 py-0.5 text-xs font-medium text-studio-gold capitalize">
            {role}
          </span>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-4">
        {role === 'teacher' && (
          <Link href="/catalog/new" className={linkClass('/catalog/new')}>
            Add to Catalog
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-studio-muted hover:text-studio-gold transition-colors duration-[150ms]"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
