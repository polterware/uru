//! Shop-scoped Shipment Repository for Multi-Database Architecture

use crate::features::shipment::models::shipment_model::Shipment;
use chrono::Utc;
use sqlx::{Result, AnyPool};
use std::sync::Arc;

pub struct ShopShipmentRepository {
    pool: Arc<AnyPool>,
}

impl ShopShipmentRepository {
    pub fn new(pool: Arc<AnyPool>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, shipment: &Shipment) -> Result<Shipment> {
        let sql = r#"
            INSERT INTO shipments (
                id, order_id, location_id, status, carrier_company, carrier_service,
                tracking_number, tracking_url, weight_g, height_mm, width_mm, depth_mm,
                package_type, shipping_label_url, invoice_url, invoice_key,
                cost_amount, insurance_amount, estimated_delivery_at,
                shipped_at, delivered_at, metadata, customs_info,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
            RETURNING *
        "#;

        sqlx::query_as::<_, Shipment>(sql)
            .bind(&shipment.id)
            .bind(&shipment.order_id)
            .bind(&shipment.location_id)
            .bind(&shipment.status)
            .bind(&shipment.carrier_company)
            .bind(&shipment.carrier_service)
            .bind(&shipment.tracking_number)
            .bind(&shipment.tracking_url)
            .bind(&shipment.weight_g)
            .bind(&shipment.height_mm)
            .bind(&shipment.width_mm)
            .bind(&shipment.depth_mm)
            .bind(&shipment.package_type)
            .bind(&shipment.shipping_label_url)
            .bind(&shipment.invoice_url)
            .bind(&shipment.invoice_key)
            .bind(&shipment.cost_amount)
            .bind(&shipment.insurance_amount)
            .bind(&shipment.estimated_delivery_at)
            .bind(&shipment.shipped_at)
            .bind(&shipment.delivered_at)
            .bind(&shipment.metadata)
            .bind(&shipment.customs_info)
            .bind(&shipment.sync_status)
            .bind(&shipment.created_at)
            .bind(&shipment.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn update(&self, shipment: &Shipment) -> Result<Shipment> {
        let sql = r#"
            UPDATE shipments SET
                order_id = $2,
                location_id = $3,
                status = $4,
                carrier_company = $5,
                carrier_service = $6,
                tracking_number = $7,
                tracking_url = $8,
                weight_g = $9,
                height_mm = $10,
                width_mm = $11,
                depth_mm = $12,
                package_type = $13,
                shipping_label_url = $14,
                invoice_url = $15,
                invoice_key = $16,
                cost_amount = $17,
                insurance_amount = $18,
                estimated_delivery_at = $19,
                shipped_at = $20,
                delivered_at = $21,
                metadata = $22,
                customs_info = $23,
                _status = $24,
                updated_at = $25
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Shipment>(sql)
            .bind(&shipment.id)
            .bind(&shipment.order_id)
            .bind(&shipment.location_id)
            .bind(&shipment.status)
            .bind(&shipment.carrier_company)
            .bind(&shipment.carrier_service)
            .bind(&shipment.tracking_number)
            .bind(&shipment.tracking_url)
            .bind(&shipment.weight_g)
            .bind(&shipment.height_mm)
            .bind(&shipment.width_mm)
            .bind(&shipment.depth_mm)
            .bind(&shipment.package_type)
            .bind(&shipment.shipping_label_url)
            .bind(&shipment.invoice_url)
            .bind(&shipment.invoice_key)
            .bind(&shipment.cost_amount)
            .bind(&shipment.insurance_amount)
            .bind(&shipment.estimated_delivery_at)
            .bind(&shipment.shipped_at)
            .bind(&shipment.delivered_at)
            .bind(&shipment.metadata)
            .bind(&shipment.customs_info)
            .bind(&shipment.sync_status)
            .bind(&shipment.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Shipment>> {
        let sql = "SELECT * FROM shipments WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, Shipment>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Shipment>> {
        let sql = "SELECT * FROM shipments WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        sqlx::query_as::<_, Shipment>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_order(&self, order_id: &str) -> Result<Vec<Shipment>> {
        let sql = "SELECT * FROM shipments WHERE order_id = $1 AND (_status IS NULL OR _status != 'deleted') ORDER BY created_at DESC";
        sqlx::query_as::<_, Shipment>(sql)
            .bind(order_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE shipments SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Shipment> {
        let sql = r#"
            UPDATE shipments SET status = $2, _status = 'modified', updated_at = $3 WHERE id = $1 RETURNING *
        "#;
        sqlx::query_as::<_, Shipment>(sql)
            .bind(id)
            .bind(status)
            .bind(Utc::now())
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn mark_shipped(&self, id: &str, tracking_number: Option<&str>) -> Result<Shipment> {
        let sql = r#"
            UPDATE shipments
            SET status = 'shipped', shipped_at = $2, tracking_number = COALESCE($3, tracking_number), _status = 'modified', updated_at = $4
            WHERE id = $1
            RETURNING *
        "#;
        let now = Utc::now();
        sqlx::query_as::<_, Shipment>(sql)
            .bind(id)
            .bind(now)
            .bind(tracking_number)
            .bind(now)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn mark_delivered(&self, id: &str) -> Result<Shipment> {
        let sql = r#"
            UPDATE shipments
            SET status = 'delivered', delivered_at = $2, _status = 'modified', updated_at = $3
            WHERE id = $1
            RETURNING *
        "#;
        let now = Utc::now();
        sqlx::query_as::<_, Shipment>(sql)
            .bind(id)
            .bind(now)
            .bind(now)
            .fetch_one(&*self.pool)
            .await
    }
}
