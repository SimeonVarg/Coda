import type { StudentProfile } from "@/lib/types"

interface ProfileHeaderProps {
  profile: StudentProfile | null
  studentName?: string
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
    <div className="mb-6 rounded-2xl bg-studio-surface shadow-studio-glow px-4 py-4 space-y-1">
      {studentName && (
        <p className="text-base font-semibold text-studio-cream font-display mb-2">{studentName}</p>
      )}
      {profile.instrument && (
        <p className="text-sm text-studio-text">
          <span className="font-medium text-studio-cream">Instrument:</span> {profile.instrument}
        </p>
      )}
      {profile.grade_level && (
        <p className="text-sm text-studio-text">
          <span className="font-medium text-studio-cream">Grade Level:</span> {profile.grade_level}
        </p>
      )}
      {profile.goals && (
        <p className="text-sm text-studio-muted mt-1 whitespace-pre-wrap">
          <span className="font-medium text-studio-cream">Goals:</span> {profile.goals}
        </p>
      )}
    </div>
  )
}
