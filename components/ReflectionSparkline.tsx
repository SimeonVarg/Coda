'use client'

interface Props {
  ratings: number[]  // array of 1-5 values, chronological
}

export default function ReflectionSparkline({ ratings }: Props) {
  if (ratings.length < 2) return null

  const W = 120
  const H = 32
  const pad = 4
  const n = ratings.length
  const xStep = (W - pad * 2) / (n - 1)

  const points = ratings.map((r, i) => {
    const x = pad + i * xStep
    const y = H - pad - ((r - 1) / 4) * (H - pad * 2)
    return `${x},${y}`
  })

  const avg = (ratings.reduce((a, b) => a + b, 0) / n).toFixed(1)

  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} aria-label={`Self-rating trend over ${n} lessons`} role="img">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#e8b84b"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {ratings.map((r, i) => (
          <circle
            key={i}
            cx={pad + i * xStep}
            cy={H - pad - ((r - 1) / 4) * (H - pad * 2)}
            r="2"
            fill="#e8b84b"
          />
        ))}
      </svg>
      <div className="text-xs text-studio-muted">
        <span className="text-studio-gold font-medium">{avg}</span>
        <span className="ml-1">avg rating</span>
      </div>
    </div>
  )
}
