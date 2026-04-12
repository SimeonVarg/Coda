import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TagList from './TagList'
import type { TagWithStatus } from '@/lib/types'

// Unit tests — subtask 4.1
// Validates: Requirements 3.5
describe('TagList', () => {
  const repertoireTag: TagWithStatus = {
    item: { id: '1', title: 'Moonlight Sonata', composer: 'Beethoven', type: 'repertoire' },
    status: 'introduced',
  }

  const theoryTag: TagWithStatus = {
    item: { id: '2', title: 'Circle of Fifths', composer: null, type: 'theory' },
    status: 'completed',
  }

  it('renders TagStatusSelector for repertoire items', () => {
    render(
      <TagList
        tags={[repertoireTag]}
        onRemove={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    // TagStatusSelector renders a combobox (select element)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('does not render TagStatusSelector for theory items', () => {
    render(
      <TagList
        tags={[theoryTag]}
        onRemove={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('renders a static "Completed" label for theory items', () => {
    render(
      <TagList
        tags={[theoryTag]}
        onRemove={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders both selector and completed label when both types are present', () => {
    render(
      <TagList
        tags={[repertoireTag, theoryTag]}
        onRemove={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders item title and composer', () => {
    render(
      <TagList
        tags={[repertoireTag]}
        onRemove={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    expect(screen.getByText('Moonlight Sonata')).toBeInTheDocument()
    expect(screen.getByText('— Beethoven')).toBeInTheDocument()
  })

  it('renders remove button for each tag', () => {
    render(
      <TagList
        tags={[repertoireTag, theoryTag]}
        onRemove={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('returns null when tags array is empty', () => {
    const { container } = render(
      <TagList tags={[]} onRemove={vi.fn()} onStatusChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })
})
