'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

interface NavBarProps {
  role?: 'teacher' | 'student' | null
}

export default function NavBar({ role }: NavBarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Close on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

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
    <nav
      ref={menuRef}
      className="bg-studio-bg border-b border-studio-primary/30 px-6 py-3 flex items-center justify-between relative overflow-visible"
      style={{ position: 'relative', zIndex: 10 }}
    >
      {/* Left: logo + brand + role badge */}
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

      {/* Desktop nav */}
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

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 text-studio-text hover:text-studio-gold transition-colors duration-[150ms]"
      >
        <span className={`block w-5 h-0.5 bg-current transition-transform duration-150 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
        <span className={`block w-5 h-0.5 bg-current transition-opacity duration-150 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-current transition-transform duration-150 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-studio-surface border-b border-studio-primary/30 shadow-studio-glow py-3 px-6 flex flex-col gap-3">
          {role === 'teacher' && (
            <Link
              href="/catalog/new"
              className="text-sm text-studio-text hover:text-studio-gold transition-colors duration-[150ms]"
            >
              Add to Catalog
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-studio-muted hover:text-studio-gold transition-colors duration-[150ms] text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
