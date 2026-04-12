interface MotifProps {
  className?: string
  opacity?: number
  color?: string
}

export default function StaffLines({ className, opacity = 0.3, color = 'currentColor' }: MotifProps) {
  const lineYPositions = [5, 15, 25, 35, 45]
  return (
    <svg
      viewBox="0 0 400 50"
      width="400"
      height="50"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      {lineYPositions.map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={color} strokeWidth="1.5" />
      ))}
    </svg>
  )
}
