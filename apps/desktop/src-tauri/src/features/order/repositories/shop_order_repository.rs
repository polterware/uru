//! Shop-scoped Order Repository for Multi-Database Architecture

use crate::features::order::models::order_model::Order;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, Sqlite, SqlitePool, Transaction};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopOrder {
    pub id: String,
    pub order_number: Option<i64>,
    pub idempotency_key: Option<String>,
    pub channel: Option<String>,
    pub customer_id: Option<String>,
    pub status: Option<String>,
    pub payment_status: Option<String>,
    pub fulfillment_status: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: f64,
    pub total_discounts: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_tip: Option<f64>,
    pub total_price: f64,
    pub tax_lines: Option<String>,
    pub discount_codes: Option<String>,
    pub note: Option<String>,
    pub tags: Option<String>,
    pub custom_attributes: Option<String>,
    pub metadata: Option<String>,
    pub customer_snapshot: String,
    pub billing_address: Option<String>,
    pub shipping_address: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub cancelled_at: Option<DateTime<Utc>>,
    pub closed_at: Option<DateTime<Utc>>,
}

impl ShopOrder {
    fn into_order(self, shop_id: String) -> Order {
        Order {
            id: self.id,
            order_number: self.order_number,
            idempotency_key: self.idempotency_key,
            channel: self.channel,
            shop_id: Some(shop_id),
            customer_id: self.customer_id,
            status: self.status,
            payment_status: self.payment_status,
            fulfillment_status: self.fulfillment_status,
            currency: self.currency,
            subtotal_price: self.subtotal_price,
            total_discounts: self.total_discounts,
            total_tax: self.total_tax,
            total_shipping: self.total_shipping,
            total_tip: self.total_tip,
            total_price: self.total_price,
            tax_lines: self.tax_lines,
            discount_codes: self.discount_codes,
            note: self.note,
            tags: self.tags,
            custom_attributes: self.custom_attributes,
            metadata: self.metadata,
            customer_snapshot: self.customer_snapshot,
            billing_address: self.billing_address,
            shipping_address: self.shipping_address,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
            cancelled_at: self.cancelled_at,
            closed_at: self.closed_at,
        }
    }
}

pub struct ShopOrderRepository {
    pool: Arc<SqlitePool>,
    shop_id: String,
}

impl ShopOrderRepository {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, order: &Order) -> Result<Order> {
        let sql = r#"
            INSERT INTO orders (
                id, order_number, idempotency_key, channel, customer_id,
                status, payment_status, fulfillment_status, currency, subtotal_price,
                total_discounts, total_tax, total_shipping, total_tip, total_price,
                tax_lines, discount_codes, note, tags, custom_attributes, metadata,
                customer_snapshot, billing_address, shipping_address, _status,
                created_at, updated_at, cancelled_at, closed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
            RETURNING *
        "#;

        let shop_order = sqlx::query_as::<_, ShopOrder>(sql)
            .bind(&order.id)
            .bind(&order.order_number)
            .bind(&order.idempotency_key)
            .bind(&order.channel)
            .bind(&order.customer_id)
            .bind(&order.status)
            .bind(&order.payment_status)
            .bind(&order.fulfillment_status)
            .bind(&order.currency)
            .bind(order.subtotal_price)
            .bind(&order.total_discounts)
            .bind(&order.total_tax)
            .bind(&order.total_shipping)
            .bind(&order.total_tip)
            .bind(order.total_price)
            .bind(&order.tax_lines)
            .bind(&order.discount_codes)
            .bind(&order.note)
            .bind(&order.tags)
            .bind(&order.custom_attributes)
            .bind(&order.metadata)
            .bind(&order.customer_snapshot)
            .bind(&order.billing_address)
            .bind(&order.shipping_address)
            .bind(&order.sync_status)
            .bind(&order.created_at)
            .bind(&order.updated_at)
            .bind(&order.cancelled_at)
            .bind(&order.closed_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_order.into_order(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Order>> {
        let sql = "SELECT * FROM orders WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopOrder>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|o| o.into_order(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Order>> {
        let sql = "SELECT * FROM orders WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopOrder>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|o| o.into_order(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE orders SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_payment_status(&self, id: &str, status: &str) -> Result<Order> {
        let sql = r#"
            UPDATE orders SET payment_status = $2, _status = 'modified', updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        let shop_order = sqlx::query_as::<_, ShopOrder>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_order.into_order(self.shop_id.clone()))
    }

    pub async fn update_fulfillment_status(&self, id: &str, status: &str) -> Result<Order> {
        let sql = r#"
            UPDATE orders SET fulfillment_status = $2, _status = 'modified', updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        let shop_order = sqlx::query_as::<_, ShopOrder>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_order.into_order(self.shop_id.clone()))
    }

    pub async fn cancel(&self, id: &str) -> Result<Order> {
        let sql = r#"
            UPDATE orders SET status = 'cancelled', cancelled_at = datetime('now'), updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        let shop_order = sqlx::query_as::<_, ShopOrder>(sql)
            .bind(id)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_order.into_order(self.shop_id.clone()))
    }

    pub async fn cancel_in_tx(tx: &mut Transaction<'_, Sqlite>, id: &str, shop_id: String) -> Result<Order> {
        let sql = r#"
            UPDATE orders SET status = 'cancelled', cancelled_at = datetime('now'), updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;
        let shop_order = sqlx::query_as::<_, ShopOrder>(sql)
            .bind(id)
            .fetch_one(&mut **tx)
            .await?;

        Ok(shop_order.into_order(shop_id))
    }
}
