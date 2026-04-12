'use client'

import React from 'react'

// Only symbols with reliable cross-platform rendering.
// SMuFL-only glyphs (U+1D100-U+1D1FF range) need Noto Music loaded.
// BMP symbols (♩♪♫♬♭♮♯) work everywhere as fallback.
const MUSIC_SYMBOLS = [
  // Clefs (Noto Music)
  '\uD834\uDD1E', // � treble clef
  '\uD834\uDD22', // 𝄢 bass clef
  '\uD834\uDD21', // � neutral clef
  '\uD834\uDD20', // � percussion clef
  // Repeat barlines
  '\uD834\uDD06', // 𝄆 begin repeat
  '\uD834\uDD07', // 𝄇 end repeat
  // Rests — whole through sixteenth
  '\uD834\uDD3B', // 𝄻 whole rest
  '\uD834\uDD3C', // 𝄼 half rest
  '\uD834\uDD3D', // 𝄽 quarter rest
  '\uD834\uDD3E', // 𝄾 eighth rest
  '\uD834\uDD3F', // 𝄿 sixteenth rest
  // Dynamics
  '\uD834\uDD8F', // � piano
  '\uD834\uDD90', // � mezzo
  '\uD834\uDD91', // 𝆑 forte
  '\uD834\uDD92', // � crescendo
  '\uD834\uDD93', // � decrescendo
  // Accidentals — BMP, universal
  '\u266D', // ♭ flat
  '\u266E', // ♮ natural
  '\u266F', // ♯ sharp
  '\uD834\uDD2B', // 𝄫 double flat
  '\uD834\uDD2A', // 𝄪 double sharp
  // Note symbols — BMP, universal
  '\u2669', // ♩ quarter note
  '\u266A', // ♪ eighth note
  '\u266B', // ♫ beamed eighth notes
  '\u266C', // ♬ beamed sixteenth notes
  // Time sig cut common
  '\uD834\uDD35', // 𝄵 cut time
]

function seededRand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

interface SymbolInstance {
  symbol: string
  top: number
  left: number
  size: number
  rot: number
  op: number
}

function generateGrid(): SymbolInstance[] {
  const COLS = 22
  const ROWS = 15
  const rand = seededRand(31337)
  const out: SymbolInstance[] = []

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cellW = 100 / COLS
      const cellH = 100 / ROWS
      const basLeft = col * cellW + cellW / 2
      const basTop  = row * cellH + cellH / 2

      // ±35% jitter — organic but not overlapping
      const jitterX = (rand() - 0.5) * cellW * 0.5
      const jitterY = (rand() - 0.5) * cellH * 0.5

      // Slightly bigger: 20–34px
      const size = 30 + Math.floor(rand() * 15)

      out.push({
        symbol: MUSIC_SYMBOLS[Math.floor(rand() * MUSIC_SYMBOLS.length)],
        left:   Math.max(0.2, Math.min(99, basLeft + jitterX)),
        top:    Math.max(0.2, Math.min(99, basTop  + jitterY)),
        size,
        rot:    Math.floor(rand() * 60) - 30,
        op:     0.10 + rand() * 0.15,
      })
    }
  }
  return out
}

const INSTANCES = generateGrid()

export default function MusicBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {INSTANCES.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: `${s.top}vh`,
            left: `${s.left}vw`,
            fontSize: `${s.size}px`,
            lineHeight: 1,
            color: '#e8b84b',
            opacity: s.op,
            transform: `rotate(${s.rot}deg)`,
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: '"Noto Music", "Bravura", "Gonville", serif',
          }}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  )
}
