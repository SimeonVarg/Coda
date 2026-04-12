export default function ProgressLoading() {
  return (
    <div className="mt-4 space-y-6">
      {/* Profile header placeholder — matches ProfileHeader layout */}
      <div className="rounded-2xl bg-studio-surface shadow-studio-glow px-4 py-4 space-y-2 mb-6">
        <div className="h-4 w-32 bg-studio-rim rounded animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]" />
        <div className="h-4 w-24 bg-studio-rim rounded animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]" />
        <div className="h-4 w-48 bg-studio-rim rounded animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]" />
      </div>

      {/* Repertoire section placeholder */}
      <div className="space-y-3">
        <div className="h-5 w-28 bg-studio-rim rounded animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]" />
        <div className="space-y-2 pl-4 border-l-2 border-studio-primary/30">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-studio-surface rounded-lg animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]"
            />
          ))}
        </div>
      </div>

      {/* Lesson notes placeholder */}
      <div className="space-y-3">
        <div className="h-5 w-32 bg-studio-rim rounded animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]" />
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-studio-surface rounded-lg animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
