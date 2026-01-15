use crate::models::inventory_level::InventoryLevel;
use sqlx::{SqlitePool, Result};

pub struct InventoryLevelsRepository {
    pool: SqlitePool,
}

impl InventoryLevelsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: InventoryLevel) -> Result<InventoryLevel> {
        let sql = r#"
            INSERT INTO inventory_levels (
                id, product_id, location_id, batch_number, serial_number, expiry_date,
                quantity_on_hand, quantity_reserved, stock_status, aisle_bin_slot,
                last_counted_at, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(item.id)
            .bind(item.product_id)
            .bind(item.location_id)
            .bind(item.batch_number)
            .bind(item.serial_number)
            .bind(item.expiry_date)
            .bind(item.quantity_on_hand)
            .bind(item.quantity_reserved)
            .bind(item.stock_status)
            .bind(item.aisle_bin_slot)
            .bind(item.last_counted_at)
            .bind(item.sync_status)
            .bind(item.created_at)
            .bind(item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: InventoryLevel) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels SET
                product_id = $2,
                location_id = $3,
                batch_number = $4,
                serial_number = $5,
                expiry_date = $6,
                quantity_on_hand = $7,
                quantity_reserved = $8,
                stock_status = $9,
                aisle_bin_slot = $10,
                last_counted_at = $11,
                _status = $12,
                updated_at = $13
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(item.id)
            .bind(item.product_id)
            .bind(item.location_id)
            .bind(item.batch_number)
            .bind(item.serial_number)
            .bind(item.expiry_date)
            .bind(item.quantity_on_hand)
            .bind(item.quantity_reserved)
            .bind(item.stock_status)
            .bind(item.aisle_bin_slot)
            .bind(item.last_counted_at)
            .bind(item.sync_status)
            .bind(item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM inventory_levels WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<InventoryLevel>> {
        sqlx::query_as::<_, InventoryLevel>("SELECT * FROM inventory_levels WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_all(&self) -> Result<Vec<InventoryLevel>> {
        sqlx::query_as::<_, InventoryLevel>("SELECT * FROM inventory_levels")
            .fetch_all(&self.pool)
            .await
    }
}
