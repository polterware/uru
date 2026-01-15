use crate::models::shipment_item::ShipmentItem;
use sqlx::{SqlitePool, Result};

pub struct ShipmentItemsRepository {
    pool: SqlitePool,
}

impl ShipmentItemsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: ShipmentItem) -> Result<ShipmentItem> {
        let sql = r#"
            INSERT INTO shipment_items (
                id, shipment_id, order_item_id, quantity,
                batch_number, serial_numbers, _status,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        "#;

        sqlx::query_as::<_, ShipmentItem>(sql)
            .bind(item.id)              // $1
            .bind(item.shipment_id)     // $2
            .bind(item.order_item_id)   // $3
            .bind(item.quantity)        // $4
            .bind(item.batch_number)    // $5
            .bind(item.serial_numbers)  // $6
            .bind(item.sync_status)     // $7
            .bind(item.created_at)      // $8
            .bind(item.updated_at)      // $9
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: ShipmentItem) -> Result<ShipmentItem> {
        let sql = r#"
            UPDATE shipment_items SET
                shipment_id = $2,
                order_item_id = $3,
                quantity = $4,
                batch_number = $5,
                serial_numbers = $6,
                _status = $7,
                updated_at = $8
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, ShipmentItem>(sql)
            .bind(item.id)              // $1
            .bind(item.shipment_id)     // $2
            .bind(item.order_item_id)   // $3
            .bind(item.quantity)        // $4
            .bind(item.batch_number)    // $5
            .bind(item.serial_numbers)  // $6
            .bind(item.sync_status)     // $7
            .bind(item.updated_at)      // $8
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<ShipmentItem>> {
        let sql = "SELECT * FROM shipment_items WHERE id = $1";

        sqlx::query_as::<_, ShipmentItem>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn find_by_shipment_id(&self, shipment_id: &str) -> Result<Vec<ShipmentItem>> {
        let sql = "SELECT * FROM shipment_items WHERE shipment_id = $1 ORDER BY created_at ASC";

        sqlx::query_as::<_, ShipmentItem>(sql)
            .bind(shipment_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM shipment_items WHERE id = $1";

        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn delete_by_shipment_id(&self, shipment_id: &str) -> Result<()> {
        let sql = "DELETE FROM shipment_items WHERE shipment_id = $1";

        sqlx::query(sql)
            .bind(shipment_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
