import { getDb } from '../client'
import { Debtor } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class DebtorsRepository {
  static async getAll(): Promise<Debtor[]> {
    console.log('[DebtorsRepository] getAll called')
    try {
      const db = await getDb()
      const result = await db.select<Debtor[]>(
        'SELECT * FROM debtors ORDER BY name ASC',
      )
      console.log('[DebtorsRepository] getAll result count:', result.length)
      return result
    } catch (error) {
      console.error('[DebtorsRepository] getAll error:', error)
      throw error
    }
  }

  static async create(
    debtor: Omit<Debtor, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    console.log('[DebtorsRepository] create called with:', debtor)
    try {
      const db = await getDb()
      const id = uuidv4()
      const now = new Date().toISOString()

      await db.execute(
        `INSERT INTO debtors (
            id, name, phone, email, notes, current_balance, status,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          debtor.name,
          debtor.phone ?? null,
          debtor.email ?? null,
          debtor.notes ?? null,
          debtor.current_balance,
          debtor.status,
          now,
          now,
        ],
      )
      console.log('[DebtorsRepository] create success, id:', id)
      return id
    } catch (error) {
      console.error('[DebtorsRepository] create error:', error)
      throw error
    }
  }

  static async update(id: string, debtor: Partial<Debtor>): Promise<void> {
    console.log('[DebtorsRepository] update called with:', { id, debtor })
    try {
      const db = await getDb()
      const now = new Date().toISOString()

      const fields: string[] = []
      const values: any[] = []
      let i = 1

      Object.entries(debtor).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          fields.push(`${key} = $${i}`)
          values.push(value ?? null)
          i++
        }
      })

      fields.push(`updated_at = $${i}`)
      values.push(now)
      values.push(id)

      const query = `UPDATE debtors SET ${fields.join(', ')} WHERE id = $${i + 1}`
      console.log('[DebtorsRepository] update query:', query, values)

      await db.execute(query, values)
      console.log('[DebtorsRepository] update success')
    } catch (error) {
      console.error('[DebtorsRepository] update error:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    const db = await getDb()
    const now = new Date().toISOString()

    // Soft delete
    await db.execute(
      'UPDATE debtors SET deleted_at = $1, updated_at = $2 WHERE id = $3',
      [now, now, id],
    )
  }
}
