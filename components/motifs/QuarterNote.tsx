import React from 'react'

interface MotifProps {
  className?: string
  opacity?: number
  color?: string
  style?: React.CSSProperties
}

export default function QuarterNote({ className, opacity = 0.5, color = 'currentColor', style }: MotifProps) {
  return (
    <svg
      viewBox="0 0 32 80"
      width="32"
      height="80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity, ...style }}
      fill={color}
    >
      {/* Stem */}
      <rect x="19" y="6" width="3" height="56" />
      {/* Note head */}
      <ellipse cx="13" cy="65" rx="11" ry="8" transform="rotate(-20 13 65)" />
    </svg>
  )
}
