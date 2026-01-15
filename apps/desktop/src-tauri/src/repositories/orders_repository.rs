use crate::models::order_model::Order;
use sqlx::{SqlitePool, Result};

pub struct OrdersRepository {
    pool: SqlitePool,
}

impl OrdersRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, order: Order) -> Result<Order> {
        let sql = r#"
            INSERT INTO orders (
                id, order_number, idempotency_key, channel, shop_id, customer_id,
                status, payment_status, fulfillment_status, currency, subtotal_price,
                total_discounts, total_tax, total_shipping, total_tip, total_price,
                tax_lines, discount_codes, note, tags, custom_attributes, metadata,
                customer_snapshot, billing_address, shipping_address, _status,
                created_at, updated_at, cancelled_at, closed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(order.id)                 // $1
            .bind(order.order_number)       // $2
            .bind(order.idempotency_key)    // $3
            .bind(order.channel)            // $4
            .bind(order.shop_id)           // $5
            .bind(order.customer_id)        // $6
            .bind(order.status)             // $7
            .bind(order.payment_status)     // $8
            .bind(order.fulfillment_status)  // $9
            .bind(order.currency)           // $10
            .bind(order.subtotal_price)     // $11
            .bind(order.total_discounts)    // $12
            .bind(order.total_tax)          // $13
            .bind(order.total_shipping)     // $14
            .bind(order.total_tip)          // $15
            .bind(order.total_price)        // $16
            .bind(order.tax_lines)          // $17
            .bind(order.discount_codes)     // $18
            .bind(order.note)               // $19
            .bind(order.tags)               // $20
            .bind(order.custom_attributes)   // $21
            .bind(order.metadata)           // $22
            .bind(order.customer_snapshot)   // $23
            .bind(order.billing_address)     // $24
            .bind(order.shipping_address)    // $25
            .bind(order.sync_status)        // $26
            .bind(order.created_at)          // $27
            .bind(order.updated_at)          // $28
            .bind(order.cancelled_at)        // $29
            .bind(order.closed_at)           // $30
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, order: Order) -> Result<Order> {
        let sql = r#"
            UPDATE orders SET
                order_number = $2,
                idempotency_key = $3,
                channel = $4,
                shop_id = $5,
                customer_id = $6,
                status = $7,
                payment_status = $8,
                fulfillment_status = $9,
                currency = $10,
                subtotal_price = $11,
                total_discounts = $12,
                total_tax = $13,
                total_shipping = $14,
                total_tip = $15,
                total_price = $16,
                tax_lines = $17,
                discount_codes = $18,
                note = $19,
                tags = $20,
                custom_attributes = $21,
                metadata = $22,
                customer_snapshot = $23,
                billing_address = $24,
                shipping_address = $25,
                _status = $26,
                updated_at = $27,
                cancelled_at = $28,
                closed_at = $29
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(order.id)                 // $1
            .bind(order.order_number)       // $2
            .bind(order.idempotency_key)    // $3
            .bind(order.channel)            // $4
            .bind(order.shop_id)           // $5
            .bind(order.customer_id)        // $6
            .bind(order.status)             // $7
            .bind(order.payment_status)     // $8
            .bind(order.fulfillment_status)  // $9
            .bind(order.currency)           // $10
            .bind(order.subtotal_price)     // $11
            .bind(order.total_discounts)    // $12
            .bind(order.total_tax)          // $13
            .bind(order.total_shipping)     // $14
            .bind(order.total_tip)          // $15
            .bind(order.total_price)        // $16
            .bind(order.tax_lines)          // $17
            .bind(order.discount_codes)     // $18
            .bind(order.note)               // $19
            .bind(order.tags)               // $20
            .bind(order.custom_attributes)   // $21
            .bind(order.metadata)           // $22
            .bind(order.customer_snapshot)   // $23
            .bind(order.billing_address)     // $24
            .bind(order.shipping_address)    // $25
            .bind(order.sync_status)        // $26
            .bind(order.updated_at)          // $27
            .bind(order.cancelled_at)        // $28
            .bind(order.closed_at)           // $29
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Order>> {
        let sql = "SELECT * FROM orders WHERE id = $1";

        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Order>> {
        let sql = "SELECT * FROM orders ORDER BY created_at DESC";

        sqlx::query_as::<_, Order>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM orders WHERE id = $1";

        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
