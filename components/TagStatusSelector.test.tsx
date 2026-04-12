import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import TagStatusSelector from './TagStatusSelector'
import type { RepertoireStatus } from '@/lib/types'

// Unit tests — subtask 3.1
describe('TagStatusSelector', () => {
  it('renders exactly three options with correct labels', () => {
    render(<TagStatusSelector value="introduced" onChange={() => {}} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('Introduced')
    expect(options[1]).toHaveTextContent('In Progress')
    expect(options[2]).toHaveTextContent('Mastered')
  })

  it('options have correct values', () => {
    render(<TagStatusSelector value="introduced" onChange={() => {}} />)
    expect(screen.getByRole('option', { name: 'Introduced' })).toHaveValue('introduced')
    expect(screen.getByRole('option', { name: 'In Progress' })).toHaveValue('in_progress')
    expect(screen.getByRole('option', { name: 'Mastered' })).toHaveValue('mastered')
  })

  it('reflects the current value as selected', () => {
    render(<TagStatusSelector value="in_progress" onChange={() => {}} />)
    expect(screen.getByRole('combobox')).toHaveValue('in_progress')
  })

  it('calls onChange with the selected status', () => {
    const onChange = vi.fn()
    render(<TagStatusSelector value="introduced" onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mastered' } })
    expect(onChange).toHaveBeenCalledWith('mastered')
  })

  it('is disabled when disabled prop is true', () => {
    render(<TagStatusSelector value="introduced" onChange={() => {}} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})

// Property-based test — subtask 3.2
// Feature: repertoire-status-tracking, Property 3: Status selection updates in-memory tag state
// Validates: Requirements 3.3
describe('TagStatusSelector — Property 3: status selection updates in-memory tag state', () => {
  it('selecting any valid RepertoireStatus calls onChange with exactly that value', () => {
    const statusArb = fc.constantFrom<RepertoireStatus>('introduced', 'in_progress', 'mastered')

    fc.assert(
      fc.property(statusArb, statusArb, (initial, selected) => {
        const received: RepertoireStatus[] = []
        const { unmount } = render(
          <TagStatusSelector value={initial} onChange={(s) => received.push(s)} />
        )
        fireEvent.change(screen.getByRole('combobox'), { target: { value: selected } })
        expect(received).toHaveLength(1)
        expect(received[0]).toBe(selected)
        unmount()
      }),
      { numRuns: 100 }
    )
  })
})
