import { describe, expect, it } from 'vitest'

import { escapeCsvValue, getHeaderLabel, normalizeCsvValue } from '@/components/ui/table'

describe('table csv helpers', () => {
  it('normalizes primitive and null values', () => {
    expect(normalizeCsvValue(null)).toBe('')
    expect(normalizeCsvValue(undefined)).toBe('')
    expect(normalizeCsvValue('abc')).toBe('abc')
    expect(normalizeCsvValue(12.5)).toBe('12.5')
    expect(normalizeCsvValue(true)).toBe('true')
  })

  it('normalizes objects and dates', () => {
    const date = new Date('2026-03-01T10:00:00.000Z')
    expect(normalizeCsvValue(date)).toBe('2026-03-01T10:00:00.000Z')
    expect(normalizeCsvValue({ name: 'Alpha' })).toBe('{"name":"Alpha"}')
  })

  it('escapes csv values with quotes', () => {
    expect(escapeCsvValue('Hello')).toBe('"Hello"')
    expect(escapeCsvValue('A "quote" here')).toBe('"A ""quote"" here"')
  })

  it('returns a string header label or fallback', () => {
    expect(getHeaderLabel('Status', 'status')).toBe('Status')
    expect(getHeaderLabel({ text: 'Status' }, 'status')).toBe('status')
  })
})
