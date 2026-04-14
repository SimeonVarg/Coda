import Link from "next/link"
import { MusicBackground } from "@/components/motifs"

export default function NotFound() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-studio-bg flex flex-col items-center justify-center px-6 text-center" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      <div className="relative space-y-6 max-w-md">
        {/* Musical rest symbol as the 404 visual */}
        <div className="text-studio-gold font-display text-8xl leading-none select-none" aria-hidden="true">
          𝄽
        </div>
        <h1 className="font-display text-5xl text-studio-cream tracking-wide">
          Page Not Found
        </h1>
        <p className="text-studio-muted text-base">
          This measure is empty — the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="studio-btn-primary"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
