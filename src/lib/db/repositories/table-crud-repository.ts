import type { Database } from '@/types/database'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

export type TableName = keyof Database['public']['Tables']

export type TableRow<TTable extends TableName> = Database['public']['Tables'][TTable]['Row']

export type TableInsert<TTable extends TableName> = Database['public']['Tables'][TTable]['Insert']

export type TableUpdate<TTable extends TableName> = Database['public']['Tables'][TTable]['Update']

export type TableLookupOption = {
  value: string
  label: string
}

export type ListOptions = {
  includeArchived?: boolean
  orderBy?: string
  ascending?: boolean
}

export type PayloadOptions = {
  nullableFields?: Array<string>
}

export type LookupOptions = {
  valueField: string
  labelField: string
  includeArchived?: boolean
  orderBy?: string
  ascending?: boolean
}

function normalizePayloadValue(value: unknown, nullableFields: Set<string>, key: string): unknown {
  if (value === undefined) {
    return undefined
  }

  if (value === '' && nullableFields.has(key)) {
    return null
  }

  return value
}

export function normalizePayload(
  payload: Record<string, unknown>,
  options?: PayloadOptions,
): Record<string, unknown> {
  const normalizedEntries = Object.entries(payload)
  const nullableFields = new Set(options?.nullableFields ?? [])

  return normalizedEntries.reduce<Record<string, unknown>>((acc, [key, value]) => {
    const normalizedValue = normalizePayloadValue(value, nullableFields, key)

    if (normalizedValue !== undefined) {
      acc[key] = normalizedValue
    }

    return acc
  }, {})
}

export const TableCrudRepository = {
  async list<TTable extends TableName>(
    table: TTable,
    options?: ListOptions,
  ): Promise<Array<TableRow<TTable>>> {
    const supabase = getSupabaseClient() as any

    let query = supabase.from(table).select('*')

    if (!options?.includeArchived) {
      query = query.is('deleted_at', null)
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false })
    }

    const { data, error } = await query

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<TableRow<TTable>>
  },

  async create<TTable extends TableName>(
    table: TTable,
    payload: Record<string, unknown>,
    options?: PayloadOptions,
  ): Promise<TableRow<TTable>> {
    const supabase = getSupabaseClient() as any
    const normalizedPayload = normalizePayload(payload, options)

    const { data, error } = await supabase
      .from(table)
      .insert(normalizedPayload as TableInsert<TTable>)
      .select('*')
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return data as TableRow<TTable>
  },

  async update<TTable extends TableName>(
    table: TTable,
    id: string,
    payload: Record<string, unknown>,
    options?: PayloadOptions,
  ): Promise<TableRow<TTable>> {
    const supabase = getSupabaseClient() as any
    const normalizedPayload = normalizePayload(payload, options)

    const { data, error } = await supabase
      .from(table)
      .update(normalizedPayload as TableUpdate<TTable>)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return data as TableRow<TTable>
  },

  async archive<TTable extends TableName>(table: TTable, id: string): Promise<void> {
    const supabase = getSupabaseClient() as any

    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: new Date().toISOString(),
        lifecycle_status: 'archived',
      } as TableUpdate<TTable>)
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      handleSupabaseError(error)
    }
  },

  async hardDelete<TTable extends TableName>(table: TTable, id: string): Promise<void> {
    const supabase = getSupabaseClient() as any

    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
      handleSupabaseError(error)
    }
  },

  async lookup<TTable extends TableName>(
    table: TTable,
    options: LookupOptions,
  ): Promise<Array<TableLookupOption>> {
    const supabase = getSupabaseClient() as any

    let query = supabase
      .from(table)
      .select(`${options.valueField}, ${options.labelField}`)

    if (!options.includeArchived) {
      query = query.is('deleted_at', null)
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true })
    }

    const { data, error } = await query

    if (error) {
      handleSupabaseError(error)
    }

    const rows = (data ?? []) as Array<Record<string, unknown>>

    return rows
      .map((row) => {
        const value = row[options.valueField]
        if (!value) {
          return null
        }

        const label = row[options.labelField]

        return {
          value: String(value),
          label: label ? String(label) : String(value),
        }
      })
      .filter((option): option is TableLookupOption => option !== null)
  },
}
