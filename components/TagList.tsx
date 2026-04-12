'use client'

import type { CatalogItem, RepertoireStatus, TagWithStatus } from '@/lib/types'
import TagStatusSelector from '@/components/TagStatusSelector'

interface TagListProps {
  tags: TagWithStatus[]
  onRemove: (item: CatalogItem) => void
  onStatusChange: (item: CatalogItem, status: RepertoireStatus) => void
}

export default function TagList({ tags, onRemove, onStatusChange }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Selected repertoire tags">
      {tags.map(({ item, status }) => (
        <li key={item.id} className="flex items-center gap-2 rounded-full bg-studio-surface px-3 py-1 text-sm text-studio-cream border border-studio-rim">
          <span>
            {item.title}
            {item.composer && (
              <span className="ml-1 text-studio-muted">— {item.composer}</span>
            )}
          </span>
          <span className="rounded bg-studio-rim px-1 py-0.5 text-xs capitalize text-studio-gold">
            {item.type}
          </span>
          {item.type === 'repertoire' ? (
            <TagStatusSelector
              value={status as RepertoireStatus}
              onChange={(newStatus) => onStatusChange(item, newStatus)}
            />
          ) : (
            <span className="rounded bg-studio-gold/20 px-1 py-0.5 text-xs text-studio-gold">
              Completed
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.title}`}
            className="rounded-full p-0.5 text-studio-muted hover:bg-studio-rim hover:text-studio-gold focus:outline-none focus:ring-2 focus:ring-studio-gold/50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
