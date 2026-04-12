'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-studio-rose/30 bg-studio-rose/10 p-6 text-center">
        <p className="text-sm text-studio-rose">Failed to load your students. Please try again.</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-studio-primary text-studio-bg px-4 py-2 text-sm font-medium hover:bg-studio-gold focus:outline-none focus:ring-2 focus:ring-studio-gold/50 disabled:opacity-50 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
