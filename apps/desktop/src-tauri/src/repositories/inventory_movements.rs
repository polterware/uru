use crate::models::inventory_movement::InventoryMovement;
use sqlx::{Result, SqlitePool};

pub struct InventoryMovementsRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> InventoryMovementsRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: InventoryMovement) -> Result<InventoryMovement> {
        let sql = r#"
            INSERT INTO inventory_movements (
                id, transaction_id, inventory_level_id, type, quantity,
                previous_balance, new_balance, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(item.id)               // $1
            .bind(item.transaction_id)   // $2
            .bind(item.inventory_level_id) // $3
            .bind(item.movement_type)    // $4
            .bind(item.quantity)         // $5
            .bind(item.previous_balance) // $6
            .bind(item.new_balance)      // $7
            .bind(item.sync_status)      // $8
            .bind(item.created_at)       // $9
            .bind(item.updated_at)       // $10
            .fetch_one(self.pool)
            .await
    }

    pub async fn update(&self, item: InventoryMovement) -> Result<InventoryMovement> {
        let sql = r#"
            UPDATE inventory_movements SET
                transaction_id = $2,
                inventory_level_id = $3,
                type = $4,
                quantity = $5,
                previous_balance = $6,
                new_balance = $7,
                _status = $8,
                updated_at = $9
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(item.id)               // $1
            .bind(item.transaction_id)   // $2
            .bind(item.inventory_level_id) // $3
            .bind(item.movement_type)    // $4
            .bind(item.quantity)         // $5
            .bind(item.previous_balance) // $6
            .bind(item.new_balance)      // $7
            .bind(item.sync_status)      // $8
            .bind(item.updated_at)       // $9
            .fetch_one(self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<InventoryMovement>> {
        let sql = r#"
            SELECT * FROM inventory_movements WHERE id = $1
        "#;

        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(id)
            .fetch_optional(self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = r#"
            DELETE FROM inventory_movements WHERE id = $1
        "#;

        sqlx::query(sql)
            .bind(id)
            .execute(self.pool)
            .await?;

        Ok(())
    }
}
