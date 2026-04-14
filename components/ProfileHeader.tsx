import type { StudentProfile } from "@/lib/types"

interface ProfileHeaderProps {
  profile: StudentProfile | null
  studentName?: string
}

const INSTRUMENT_ICONS: Record<string, string> = {
  piano: "🎹",
  violin: "🎻",
  cello: "🎻",
  guitar: "🎸",
  flute: "🎵",
  trumpet: "🎺",
  drums: "🥁",
  voice: "🎤",
  singing: "🎤",
}

function instrumentIcon(instrument: string): string {
  const key = instrument.toLowerCase()
  for (const [k, v] of Object.entries(INSTRUMENT_ICONS)) {
    if (key.includes(k)) return v
  }
  return "🎵"
}

export default function ProfileHeader({ profile, studentName }: ProfileHeaderProps) {
  const hasData =
    profile &&
    (profile.grade_level || profile.instrument || profile.goals)

  if (!hasData) {
    return (
      <div className="mb-6 rounded-2xl bg-studio-surface shadow-studio-glow px-4 py-3 text-sm text-studio-muted">
        No profile set yet.
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl bg-studio-surface shadow-studio-glow px-4 py-4">
      {studentName && (
        <p className="text-base font-semibold text-studio-cream font-display mb-3">{studentName}</p>
      )}

      {/* Instrument + Grade chips */}
      {(profile.instrument || profile.grade_level) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.instrument && (
            <span className="inline-flex items-center gap-1.5 bg-studio-primary/15 text-studio-primary border border-studio-primary/30 rounded-full px-3 py-1 text-xs font-medium">
              <span aria-hidden="true">{instrumentIcon(profile.instrument)}</span>
              {profile.instrument}
            </span>
          )}
          {profile.grade_level && (
            <span className="inline-flex items-center gap-1.5 bg-studio-gold/15 text-studio-gold border border-studio-gold/30 rounded-full px-3 py-1 text-xs font-medium">
              <span aria-hidden="true">🎓</span>
              {profile.grade_level}
            </span>
          )}
        </div>
      )}

      {profile.goals && (
        <p className="text-sm text-studio-muted whitespace-pre-wrap">
          <span className="font-medium text-studio-cream">Goals: </span>
          {profile.goals}
        </p>
      )}
    </div>
  )
}
