import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock lib/auth
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
vi.mock('@/lib/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

// Mock lib/demo
vi.mock('@/lib/demo', () => ({
  getDemoCredentials: (role: string) => {
    if (role === 'teacher') return { email: 'teacher@coda-demo.app', password: 'demo-teacher-2024' }
    return { email: 'student1@coda-demo.app', password: 'demo-student-2024' }
  },
  DEMO_STUDENT_ID: 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
}))

import DemoBanner from './DemoBanner'

// Stub window.location
const locationAssignSpy = vi.fn()
beforeEach(() => {
  vi.resetAllMocks()
  mockSignOut.mockResolvedValue(undefined)
  mockSignIn.mockResolvedValue({ success: true })
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '', assign: locationAssignSpy },
  })
})

// Unit tests — subtask 5.3
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
describe('DemoBanner', () => {
  it('renders "Demo Mode" text for teacher role', () => {
    render(<DemoBanner role="teacher" />)
    expect(screen.getByText('Demo Mode')).toBeInTheDocument()
  })

  it('renders "Demo Mode" text for student role', () => {
    render(<DemoBanner role="student" />)
    expect(screen.getByText('Demo Mode')).toBeInTheDocument()
  })

  it('displays "teacher" role label when role is teacher', () => {
    render(<DemoBanner role="teacher" />)
    expect(screen.getByText('teacher')).toBeInTheDocument()
  })

  it('displays "student" role label when role is student', () => {
    render(<DemoBanner role="student" />)
    expect(screen.getByText('student')).toBeInTheDocument()
  })

  it('renders "Exit Demo" button', () => {
    render(<DemoBanner role="teacher" />)
    expect(screen.getByRole('button', { name: /exit demo/i })).toBeInTheDocument()
  })

  it('renders "Switch to Student" button when role is teacher', () => {
    render(<DemoBanner role="teacher" />)
    expect(screen.getByRole('button', { name: /switch to student/i })).toBeInTheDocument()
  })

  it('renders "Switch to Teacher" button when role is student', () => {
    render(<DemoBanner role="student" />)
    expect(screen.getByRole('button', { name: /switch to teacher/i })).toBeInTheDocument()
  })

  // Req 3.2: Exit Demo calls signOut and redirects to /login
  it('calls signOut and redirects to /login on Exit Demo click', async () => {
    render(<DemoBanner role="teacher" />)
    fireEvent.click(screen.getByRole('button', { name: /exit demo/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledOnce()
    })
    expect(window.location.href).toBe('/login')
  })

  // Req 3.3: Switch Role signs out then signs in as the other role
  it('switches from teacher to student on Switch Role click', async () => {
    render(<DemoBanner role="teacher" />)
    fireEvent.click(screen.getByRole('button', { name: /switch to student/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledOnce()
      expect(mockSignIn).toHaveBeenCalledWith('student1@coda-demo.app', 'demo-student-2024')
    })
    expect(window.location.href).toBe('/progress/aaaaaaaa-bbbb-cccc-dddd-000000000002')
  })

  it('switches from student to teacher on Switch Role click', async () => {
    render(<DemoBanner role="student" />)
    fireEvent.click(screen.getByRole('button', { name: /switch to teacher/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledOnce()
      expect(mockSignIn).toHaveBeenCalledWith('teacher@coda-demo.app', 'demo-teacher-2024')
    })
    expect(window.location.href).toBe('/dashboard')
  })

  it('falls back to /login when switch role sign-in fails', async () => {
    mockSignIn.mockResolvedValueOnce({ success: false, error: 'fail' })
    render(<DemoBanner role="teacher" />)
    fireEvent.click(screen.getByRole('button', { name: /switch to student/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledOnce()
      expect(mockSignIn).toHaveBeenCalledOnce()
    })
    expect(window.location.href).toBe('/login')
  })

  // Req 3.4: Uses conservatory theme tokens
  it('uses studio-primary background class', () => {
    const { container } = render(<DemoBanner role="teacher" />)
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('bg-studio-primary')
  })

  it('uses studio-bg text class', () => {
    const { container } = render(<DemoBanner role="teacher" />)
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('text-studio-bg')
  })

  it('uses studio-cream accent class on role badge', () => {
    render(<DemoBanner role="teacher" />)
    const badge = screen.getByText('teacher')
    expect(badge.className).toContain('text-studio-cream')
  })
})
