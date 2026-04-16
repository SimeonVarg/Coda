'use client'

interface Props {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }: Props) {
  const sz = size === 'sm' ? 'text-base' : 'text-2xl'

  return (
    <div className="flex gap-1" role={readOnly ? 'img' : 'group'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onKeyDown={e => {
            if (!readOnly && onChange) {
              if (e.key === 'ArrowRight' && value < 5) onChange(value + 1)
              if (e.key === 'ArrowLeft' && value > 1) onChange(value - 1)
            }
          }}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          className={`${sz} transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <span className={star <= value ? 'text-studio-gold' : 'text-studio-rim'}>★</span>
        </button>
      ))}
    </div>
  )
}
