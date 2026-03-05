import { describe, expect, it } from 'vitest'

import * as schemaRegistry from '@/lib/schema-registry'

describe('schema registry', () => {
  it('covers all 29 tables from the schema contract', () => {
    expect(schemaRegistry.SCHEMA_REGISTRY).toHaveLength(29)
    expect(new Set(schemaRegistry.SCHEMA_TABLE_NAMES).size).toBe(29)
  })

  it('defaults to soft delete strategy for every table in this phase', () => {
    expect(schemaRegistry.SCHEMA_REGISTRY.every((table) => table.deleteStrategy === 'soft')).toBe(true)
  })

  it('exposes products table metadata with foreign key relation fields', () => {
    const products = schemaRegistry.getTableConfig('products')

    expect(products).not.toBeNull()
    expect(products?.listColumns.some((column) => column.key === 'price')).toBe(true)
    expect(products?.fields.some((field) => field.key === 'created_by' && field.autoValue === 'current_user_id')).toBe(true)

    const relationKeys = schemaRegistry.getRelationFields(products!).map((field) => field.key)
    expect(relationKeys).toEqual(expect.arrayContaining(['category_id', 'brand_id']))
  })

  it('returns null for an unknown table key', () => {
    expect(schemaRegistry.getTableConfig('not_a_table')).toBeNull()
  })
})
