import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TableCrudRepository, normalizePayload } from '@/lib/db/repositories/table-crud-repository'
import { getSupabaseClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/supabase/errors', () => ({
  handleSupabaseError: vi.fn((error: unknown) => {
    throw error
  }),
}))

describe('TableCrudRepository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('normalizes empty strings to null only for nullable fields', () => {
    const payload = normalizePayload(
      {
        name: 'Alpha',
        optional_note: '',
        required_code: '',
      },
      {
        nullableFields: ['optional_note'],
      },
    )

    expect(payload).toEqual({
      name: 'Alpha',
      optional_note: null,
      required_code: '',
    })
  })

  it('archives using deleted_at + lifecycle_status', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01T10:00:00.000Z'))

    const isMock = vi.fn().mockResolvedValue({ error: null })
    const eqMock = vi.fn().mockReturnValue({ is: isMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })

    vi.mocked(getSupabaseClient).mockReturnValue({
      from: fromMock,
    } as never)

    await TableCrudRepository.archive('products', 'row-123')

    expect(fromMock).toHaveBeenCalledWith('products')
    expect(updateMock).toHaveBeenCalledTimes(1)
    expect(updateMock.mock.calls[0]?.[0]).toMatchObject({
      lifecycle_status: 'archived',
    })
    expect(updateMock.mock.calls[0]?.[0]?.deleted_at).toBe('2026-03-01T10:00:00.000Z')
    expect(eqMock).toHaveBeenCalledWith('id', 'row-123')
    expect(isMock).toHaveBeenCalledWith('deleted_at', null)

    vi.useRealTimers()
  })

  it('builds lookup options with fallback label when label is null', async () => {
    const selectMock = vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Categoria A' },
        { id: '2', name: null },
      ],
      error: null,
    })
    const fromMock = vi.fn().mockReturnValue({
      select: selectMock,
    })

    vi.mocked(getSupabaseClient).mockReturnValue({
      from: fromMock,
    } as never)

    const options = await TableCrudRepository.lookup('categories', {
      valueField: 'id',
      labelField: 'name',
      includeArchived: true,
    })

    expect(options).toEqual([
      { value: '1', label: 'Categoria A' },
      { value: '2', label: '2' },
    ])
  })
})
