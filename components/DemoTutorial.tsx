'use client'

import { useEffect, useState } from 'react'

interface Slide {
  icon: string
  title: string
  description: string
}

const SLIDES: Record<'teacher' | 'student', Slide[]> = {
  teacher: [
    {
      icon: '👩‍🏫',
      title: 'Welcome to Coda',
      description: "You're signed in as Ms. Elena Vasquez. Coda helps music teachers track student progress, lessons, and practice — all in one place.",
    },
    {
      icon: '🎓',
      title: 'Your Students',
      description: 'The dashboard shows all your students with lesson counts and pending assignments. Click any student to see their full progress.',
    },
    {
      icon: '📝',
      title: 'Lesson Notes',
      description: 'Log rich lesson notes with a built-in editor. Tag repertoire and theory items directly from the lesson to build each student\'s progress tree.',
    },
    {
      icon: '🎵',
      title: 'Repertoire & Milestones',
      description: 'Track what each student is working on — from introduced to mastered. Assign technique milestones from a curated library of 35+ skills.',
    },
    {
      icon: '📋',
      title: 'Curriculum Planner',
      description: 'Build a term-by-term curriculum plan for each student with target dates and linked repertoire or milestones. See progress at a glance.',
    },
  ],
  student: [
    {
      icon: '🎓',
      title: 'Welcome to Coda',
      description: "You're signed in as Liam Chen. Coda shows your musical journey — repertoire, practice, and goals all in one place.",
    },
    {
      icon: '🌳',
      title: 'Progress Tree',
      description: 'See every piece you\'ve worked on, from introduced to mastered. Your full lesson history is here, with notes from each session.',
    },
    {
      icon: '📓',
      title: 'Practice Journal',
      description: 'Log your daily practice sessions with duration, mood, and metronome tempos. Track your consistency and improvement over time.',
    },
    {
      icon: '💬',
      title: 'Lesson Reflections',
      description: 'After each lesson, write a quick self-assessment — what went well, what was challenging, and your next goal.',
    },
    {
      icon: '📋',
      title: 'Your Curriculum Plan',
      description: 'Your teacher has mapped out your learning path with target dates. See what\'s coming up next and track what you\'ve completed.',
    },
  ],
}

interface Props {
  role: 'teacher' | 'student'
  onComplete: () => void
  onClose: () => void
}

export default function DemoTutorial({ role, onComplete, onClose }: Props) {
  const [slide, setSlide] = useState(0)
  const slides = SLIDES[role]
  const isLast = slide === slides.length - 1

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && !isLast) setSlide(s => s + 1)
      if (e.key === 'ArrowLeft' && slide > 0) setSlide(s => s - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [slide, isLast, onClose])

  const current = slides[slide]

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Demo tutorial"
    >
      <div className="bg-studio-surface rounded-2xl p-8 max-w-sm w-full shadow-studio-glow relative">
        {/* Skip */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-xs text-studio-muted hover:text-studio-cream transition-colors"
        >
          Skip
        </button>

        {/* Slide content */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4" aria-hidden="true">{current.icon}</div>
          <h2 className="font-display text-2xl text-studio-cream mb-2">{current.title}</h2>
          <p className="text-studio-muted text-sm leading-relaxed">{current.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6" aria-label={`Slide ${slide + 1} of ${slides.length}`}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i <= slide ? 'bg-studio-gold' : 'bg-studio-rim'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={isLast ? onComplete : () => setSlide(s => s + 1)}
          className="studio-btn-primary w-full"
          autoFocus={isLast}
        >
          {isLast ? 'Start exploring →' : 'Next'}
        </button>
      </div>
    </div>
  )
}
