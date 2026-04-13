'use client'

import { useState } from 'react'
import { signIn, signOut } from '@/lib/auth'
import { getDemoCredentials, DEMO_STUDENT_ID } from '@/lib/demo'

interface DemoBannerProps {
  role: 'teacher' | 'student'
}

export default function DemoBanner({ role }: DemoBannerProps) {
  const [switching, setSwitching] = useState(false)

  async function handleExit() {
    await signOut()
    window.location.href = '/login'
  }

  async function handleSwitchRole() {
    setSwitching(true)
    const otherRole = role === 'teacher' ? 'student' : 'teacher'
    const creds = getDemoCredentials(otherRole)

    await signOut()

    if (creds) {
      const result = await signIn(creds.email, creds.password)
      if (result.success) {
        window.location.href = otherRole === 'teacher'
          ? '/dashboard'
          : `/progress/${DEMO_STUDENT_ID}`
        return
      }
    }

    // Fallback: if switch fails, land on login
    window.location.href = '/login'
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-studio-primary text-studio-bg text-sm flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">Demo Mode</span>
        <span className="bg-studio-bg/20 text-studio-cream px-2 py-0.5 rounded text-xs font-medium capitalize">
          {role}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSwitchRole}
          disabled={switching}
          className="text-studio-bg hover:text-studio-cream underline underline-offset-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {switching ? 'Switching…' : `Switch to ${role === 'teacher' ? 'Student' : 'Teacher'}`}
        </button>
        <button
          type="button"
          onClick={handleExit}
          className="bg-studio-bg/20 hover:bg-studio-bg/30 text-studio-cream px-3 py-1 rounded text-xs transition-colors"
        >
          Exit Demo
        </button>
      </div>
    </div>
  )
}
