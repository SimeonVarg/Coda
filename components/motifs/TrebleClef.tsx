import React from 'react'

interface MotifProps {
  className?: string
  opacity?: number
  color?: string
  style?: React.CSSProperties
}

export default function TrebleClef({ className, opacity = 0.6, color = 'currentColor', style }: MotifProps) {
  return (
    <svg
      viewBox="0 0 100 260"
      width="100"
      height="260"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity, ...style }}
      fill={color}
    >
      {/* Stem */}
      <rect x="47" y="10" width="6" height="200" rx="3" />
      {/* Upper curl */}
      <path d="M50,10 C70,10 85,25 85,45 C85,65 70,78 50,80 C30,82 15,70 15,52 C15,34 30,22 50,22" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      {/* Lower loop */}
      <path d="M50,80 C72,80 88,95 88,115 C88,138 70,152 50,152 C30,152 12,138 12,115 C12,92 30,78 50,80" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      {/* Bottom bulb */}
      <ellipse cx="50" cy="218" rx="18" ry="14" />
      {/* Bottom tail curl */}
      <path d="M50,232 C38,232 28,224 28,212 C28,198 40,190 50,190" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
