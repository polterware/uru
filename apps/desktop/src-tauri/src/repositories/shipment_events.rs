use crate::models::shipment_event::ShipmentEvent;
use sqlx::{SqlitePool, Result};

pub struct ShipmentEventsRepository {
    pool: SqlitePool,
}

impl ShipmentEventsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, event: ShipmentEvent) -> Result<ShipmentEvent> {
        let sql = r#"
            INSERT INTO shipment_events (
                id, shipment_id, status, description, location,
                happened_at, raw_data, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        "#;

        sqlx::query_as::<_, ShipmentEvent>(sql)
            .bind(event.id)           // $1
            .bind(event.shipment_id)  // $2
            .bind(event.status)       // $3
            .bind(event.description)  // $4
            .bind(event.location)     // $5
            .bind(event.happened_at)  // $6
            .bind(event.raw_data)     // $7
            .bind(event.sync_status)  // $8
            .bind(event.created_at)   // $9
            .bind(event.updated_at)   // $10
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, event: ShipmentEvent) -> Result<ShipmentEvent> {
        let sql = r#"
            UPDATE shipment_events SET
                shipment_id = $2,
                status = $3,
                description = $4,
                location = $5,
                happened_at = $6,
                raw_data = $7,
                _status = $8,
                updated_at = $9
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, ShipmentEvent>(sql)
            .bind(event.id)           // $1
            .bind(event.shipment_id)  // $2
            .bind(event.status)       // $3
            .bind(event.description)  // $4
            .bind(event.location)     // $5
            .bind(event.happened_at)  // $6
            .bind(event.raw_data)     // $7
            .bind(event.sync_status)  // $8
            .bind(event.updated_at)   // $9
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<ShipmentEvent>> {
        let sql = "SELECT * FROM shipment_events WHERE id = $1";

        sqlx::query_as::<_, ShipmentEvent>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn find_by_shipment_id(&self, shipment_id: &str) -> Result<Vec<ShipmentEvent>> {
        let sql = "SELECT * FROM shipment_events WHERE shipment_id = $1 ORDER BY happened_at DESC";

        sqlx::query_as::<_, ShipmentEvent>(sql)
            .bind(shipment_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<ShipmentEvent>> {
        let sql = "SELECT * FROM shipment_events ORDER BY created_at DESC";

        sqlx::query_as::<_, ShipmentEvent>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM shipment_events WHERE id = $1";

        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
