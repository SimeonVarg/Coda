export default function DashboardLoading() {
  return (
    <div className="bg-studio-bg min-h-screen mx-auto max-w-3xl px-6 py-10">
      <div className="h-8 w-48 bg-studio-rim rounded animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%] mb-8" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 bg-studio-surface rounded-2xl animate-shimmer bg-gradient-to-r from-studio-rim via-studio-surface to-studio-rim bg-[length:200%_100%]"
          />
        ))}
      </div>
    </div>
  )
}
