import React from 'react'

interface MotifProps {
  className?: string
  opacity?: number
  color?: string
  style?: React.CSSProperties
}

export default function EighthNoteBeam({ className, opacity = 0.5, color = 'currentColor', style }: MotifProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="80"
      height="80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity, ...style }}
      fill={color}
    >
      {/* Left note head */}
      <ellipse cx="14" cy="66" rx="10" ry="7" transform="rotate(-20 14 66)" />
      {/* Left stem */}
      <rect x="22" y="14" width="3" height="52" />
      {/* Right note head */}
      <ellipse cx="52" cy="60" rx="10" ry="7" transform="rotate(-20 52 60)" />
      {/* Right stem */}
      <rect x="60" y="8" width="3" height="52" />
      {/* Beam */}
      <polygon points="22,14 63,8 63,18 22,24" />
    </svg>
  )
}
