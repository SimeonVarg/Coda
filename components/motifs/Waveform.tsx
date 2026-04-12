import React from 'react'

interface MotifProps {
  className?: string
  opacity?: number
  color?: string
  style?: React.CSSProperties
}

export default function Waveform({ className, opacity = 0.3, color = 'currentColor', style }: MotifProps) {
  return (
    <svg
      viewBox="0 0 200 40"
      width="200"
      height="40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity, ...style }}
    >
      <path
        d="M0 20 C12.5 20 12.5 4 25 4 C37.5 4 37.5 36 50 36 C62.5 36 62.5 4 75 4 C87.5 4 87.5 36 100 36 C112.5 36 112.5 4 125 4 C137.5 4 137.5 36 150 36 C162.5 36 162.5 4 175 4 C187.5 4 187.5 20 200 20"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
