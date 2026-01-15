import { getDb } from './client'

export async function initDb() {
  const db = await getDb()

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT,
      description TEXT,
      category TEXT,
      quantity REAL NOT NULL,
      min_stock_level REAL,
      location TEXT,
      cost_price REAL,
      selling_price REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS debtors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT,
      current_balance REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      debtor_id TEXT,
      total_amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY(debtor_id) REFERENCES debtors(id)
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      purchase_id TEXT,
      debtor_id TEXT,
      type TEXT NOT NULL,
      quantity_change REAL NOT NULL,
      unit_price_snapshot REAL,
      reason TEXT,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(item_id) REFERENCES inventory_items(id),
      FOREIGN KEY(purchase_id) REFERENCES purchases(id),
      FOREIGN KEY(debtor_id) REFERENCES debtors(id)
    );
  `)

  try {
    await db.execute(
      'ALTER TABLE inventory_movements ADD COLUMN purchase_id TEXT;',
    )
    console.log('[initDb] Added purchase_id to inventory_movements')
  } catch (e) {
    // Ignore if column already exists
  }

  console.log('[initDb] Database initialized')
}
