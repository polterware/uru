//! Shop-scoped Inventory Repository for Multi-Database Architecture

use crate::features::inventory::models::inventory_level_model::InventoryLevel;
use crate::features::transaction::models::transaction_model::InventoryMovement;
use sqlx::{Result, SqlitePool};
use std::sync::Arc;

pub struct ShopInventoryRepository {
    pool: Arc<SqlitePool>,
}

impl ShopInventoryRepository {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        Self { pool }
    }

    // ============================================================
    // Inventory Level methods
    // ============================================================

    pub async fn create_level(&self, level: &InventoryLevel) -> Result<InventoryLevel> {
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
            .bind(&level.id)
            .bind(&level.product_id)
            .bind(&level.location_id)
            .bind(&level.batch_number)
            .bind(&level.serial_number)
            .bind(&level.expiry_date)
            .bind(level.quantity_on_hand)
            .bind(level.quantity_reserved)
            .bind(&level.stock_status)
            .bind(&level.aisle_bin_slot)
            .bind(&level.last_counted_at)
            .bind(&level.sync_status)
            .bind(&level.created_at)
            .bind(&level.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn update_level(&self, level: &InventoryLevel) -> Result<InventoryLevel> {
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
            .bind(&level.id)
            .bind(&level.product_id)
            .bind(&level.location_id)
            .bind(&level.batch_number)
            .bind(&level.serial_number)
            .bind(&level.expiry_date)
            .bind(level.quantity_on_hand)
            .bind(level.quantity_reserved)
            .bind(&level.stock_status)
            .bind(&level.aisle_bin_slot)
            .bind(&level.last_counted_at)
            .bind(&level.sync_status)
            .bind(&level.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_level_by_id(&self, id: &str) -> Result<Option<InventoryLevel>> {
        let sql = "SELECT * FROM inventory_levels WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn list_levels(&self) -> Result<Vec<InventoryLevel>> {
        let sql = "SELECT * FROM inventory_levels WHERE _status IS NULL OR _status != 'deleted'";
        sqlx::query_as::<_, InventoryLevel>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_levels_by_product(&self, product_id: &str) -> Result<Vec<InventoryLevel>> {
        let sql = "SELECT * FROM inventory_levels WHERE product_id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(product_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_levels_by_location(&self, location_id: &str) -> Result<Vec<InventoryLevel>> {
        let sql = "SELECT * FROM inventory_levels WHERE location_id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(location_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn find_level_by_product_and_location(
        &self,
        product_id: &str,
        location_id: &str,
    ) -> Result<Option<InventoryLevel>> {
        let sql = r#"
            SELECT * FROM inventory_levels
            WHERE product_id = $1 AND location_id = $2 AND stock_status = 'sellable' AND (_status IS NULL OR _status != 'deleted')
            LIMIT 1
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(product_id)
            .bind(location_id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn delete_level(&self, id: &str) -> Result<()> {
        let sql = "UPDATE inventory_levels SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn adjust_quantity(
        &self,
        id: &str,
        quantity_change: f64,
    ) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_on_hand = quantity_on_hand + $2,
                _status = 'modified',
                updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity_change)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn reserve_quantity(&self, id: &str, quantity: f64) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_reserved = quantity_reserved + $2,
                _status = 'modified',
                updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn release_reservation(&self, id: &str, quantity: f64) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_reserved = quantity_reserved - $2,
                _status = 'modified',
                updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity)
            .fetch_one(&*self.pool)
            .await
    }

    // ============================================================
    // Inventory Movement methods
    // ============================================================

    pub async fn create_movement(&self, movement: &InventoryMovement) -> Result<InventoryMovement> {
        let sql = r#"
            INSERT INTO inventory_movements (
                id, transaction_id, inventory_level_id, type, quantity,
                previous_balance, new_balance, _status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(&movement.id)
            .bind(&movement.transaction_id)
            .bind(&movement.inventory_level_id)
            .bind(&movement.movement_type)
            .bind(movement.quantity)
            .bind(movement.previous_balance)
            .bind(movement.new_balance)
            .bind(&movement.sync_status)
            .bind(&movement.created_at)
            .bind(&movement.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn create_movements(&self, movements: Vec<InventoryMovement>) -> Result<Vec<InventoryMovement>> {
        let mut tx = self.pool.begin().await?;
        let mut created_movements = Vec::new();

        for movement in movements {
            let sql = r#"
                INSERT INTO inventory_movements (
                    id, transaction_id, inventory_level_id, type, quantity,
                    previous_balance, new_balance, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            "#;

            let created_movement = sqlx::query_as::<_, InventoryMovement>(sql)
                .bind(&movement.id)
                .bind(&movement.transaction_id)
                .bind(&movement.inventory_level_id)
                .bind(&movement.movement_type)
                .bind(movement.quantity)
                .bind(movement.previous_balance)
                .bind(movement.new_balance)
                .bind(&movement.sync_status)
                .bind(&movement.created_at)
                .bind(&movement.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_movements.push(created_movement);
        }

        tx.commit().await?;
        Ok(created_movements)
    }

    pub async fn list_movements(&self) -> Result<Vec<InventoryMovement>> {
        let sql = "SELECT * FROM inventory_movements ORDER BY created_at DESC";
        sqlx::query_as::<_, InventoryMovement>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_movements_by_transaction(&self, transaction_id: &str) -> Result<Vec<InventoryMovement>> {
        let sql = "SELECT * FROM inventory_movements WHERE transaction_id = $1";
        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(transaction_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_movements_by_inventory_level(&self, inventory_level_id: &str) -> Result<Vec<InventoryMovement>> {
        let sql = "SELECT * FROM inventory_movements WHERE inventory_level_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(inventory_level_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn delete_movements_by_transaction(&self, transaction_id: &str) -> Result<()> {
        let sql = "DELETE FROM inventory_movements WHERE transaction_id = $1";
        sqlx::query(sql)
            .bind(transaction_id)
            .execute(&*self.pool)
            .await?;
        Ok(())
    }
}
