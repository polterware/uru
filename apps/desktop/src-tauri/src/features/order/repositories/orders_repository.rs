use crate::db::DbTransaction;
use crate::features::order::models::order_model::Order;
use sqlx::{AnyPool, Result};

pub struct OrdersRepository {
    pool: AnyPool,
}

impl OrdersRepository {
    pub fn new(pool: AnyPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, order: Order) -> Result<Order> {
        let sql = r#"
            INSERT INTO orders (
                id, order_number, idempotency_key, channel, shop_id, customer_id,
                payment_intent_id, checkout_id,
                status, payment_status, fulfillment_status, currency, subtotal_price,
                total_discounts, total_tax, total_shipping, total_tip, total_price,
                tax_lines, discount_codes, note, tags, custom_attributes, metadata,
                customer_snapshot, billing_address, shipping_address, _status,
                created_at, updated_at, cancelled_at, closed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(&order.id) // $1
            .bind(order.order_number) // $2
            .bind(&order.idempotency_key) // $3
            .bind(&order.channel) // $4
            .bind(&order.shop_id) // $5
            .bind(&order.customer_id) // $6
            .bind(&order.payment_intent_id) // $7
            .bind(&order.checkout_id) // $8
            .bind(&order.status) // $9
            .bind(&order.payment_status) // $10
            .bind(&order.fulfillment_status) // $11
            .bind(&order.currency) // $12
            .bind(order.subtotal_price) // $13
            .bind(order.total_discounts) // $14
            .bind(order.total_tax) // $15
            .bind(order.total_shipping) // $16
            .bind(order.total_tip) // $17
            .bind(order.total_price) // $18
            .bind(&order.tax_lines) // $19
            .bind(&order.discount_codes) // $20
            .bind(&order.note) // $21
            .bind(&order.tags) // $22
            .bind(&order.custom_attributes) // $23
            .bind(&order.metadata) // $24
            .bind(&order.customer_snapshot) // $25
            .bind(&order.billing_address) // $26
            .bind(&order.shipping_address) // $27
            .bind(&order.sync_status) // $28
            .bind(&order.created_at) // $29
            .bind(&order.updated_at) // $30
            .bind(&order.cancelled_at) // $31
            .bind(&order.closed_at) // $32
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
                payment_intent_id = $7,
                checkout_id = $8,
                status = $9,
                payment_status = $10,
                fulfillment_status = $11,
                currency = $12,
                subtotal_price = $13,
                total_discounts = $14,
                total_tax = $15,
                total_shipping = $16,
                total_tip = $17,
                total_price = $18,
                tax_lines = $19,
                discount_codes = $20,
                note = $21,
                tags = $22,
                custom_attributes = $23,
                metadata = $24,
                customer_snapshot = $25,
                billing_address = $26,
                shipping_address = $27,
                _status = $28,
                updated_at = $29,
                cancelled_at = $30,
                closed_at = $31
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(&order.id) // $1
            .bind(order.order_number) // $2
            .bind(&order.idempotency_key) // $3
            .bind(&order.channel) // $4
            .bind(&order.shop_id) // $5
            .bind(&order.customer_id) // $6
            .bind(&order.payment_intent_id) // $7
            .bind(&order.checkout_id) // $8
            .bind(&order.status) // $9
            .bind(&order.payment_status) // $10
            .bind(&order.fulfillment_status) // $11
            .bind(&order.currency) // $12
            .bind(order.subtotal_price) // $13
            .bind(order.total_discounts) // $14
            .bind(order.total_tax) // $15
            .bind(order.total_shipping) // $16
            .bind(order.total_tip) // $17
            .bind(order.total_price) // $18
            .bind(&order.tax_lines) // $19
            .bind(&order.discount_codes) // $20
            .bind(&order.note) // $21
            .bind(&order.tags) // $22
            .bind(&order.custom_attributes) // $23
            .bind(&order.metadata) // $24
            .bind(&order.customer_snapshot) // $25
            .bind(&order.billing_address) // $26
            .bind(&order.shipping_address) // $27
            .bind(&order.sync_status) // $28
            .bind(&order.updated_at) // $29
            .bind(&order.cancelled_at) // $30
            .bind(&order.closed_at) // $31
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

        sqlx::query_as::<_, Order>(sql).fetch_all(&self.pool).await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Order>> {
        let sql = "SELECT * FROM orders WHERE shop_id = $1 ORDER BY created_at DESC";

        sqlx::query_as::<_, Order>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM orders WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;

        Ok(())
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Create an order within a database transaction
    pub async fn create_with_tx<'a>(tx: &mut DbTransaction<'a>, order: Order) -> Result<Order> {
        let sql = r#"
            INSERT INTO orders (
                id, order_number, idempotency_key, channel, shop_id, customer_id,
                payment_intent_id, checkout_id,
                status, payment_status, fulfillment_status, currency, subtotal_price,
                total_discounts, total_tax, total_shipping, total_tip, total_price,
                tax_lines, discount_codes, note, tags, custom_attributes, metadata,
                customer_snapshot, billing_address, shipping_address, _status,
                created_at, updated_at, cancelled_at, closed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(&order.id)
            .bind(order.order_number)
            .bind(&order.idempotency_key)
            .bind(&order.channel)
            .bind(&order.shop_id)
            .bind(&order.customer_id)
            .bind(&order.payment_intent_id)
            .bind(&order.checkout_id)
            .bind(&order.status)
            .bind(&order.payment_status)
            .bind(&order.fulfillment_status)
            .bind(&order.currency)
            .bind(order.subtotal_price)
            .bind(order.total_discounts)
            .bind(order.total_tax)
            .bind(order.total_shipping)
            .bind(order.total_tip)
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
            .fetch_one(&mut **tx)
            .await
    }

    /// Get order by ID within a database transaction
    pub async fn get_by_id_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
    ) -> Result<Option<Order>> {
        let sql = "SELECT * FROM orders WHERE id = $1";
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    /// Update payment status within a database transaction
    pub async fn update_payment_status_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        payment_status: &str,
    ) -> Result<Order> {
        let sql = r#"
            UPDATE orders
            SET payment_status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .bind(payment_status)
            .fetch_one(&mut **tx)
            .await
    }

    /// Update fulfillment status within a database transaction
    pub async fn update_fulfillment_status_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        fulfillment_status: &str,
    ) -> Result<Order> {
        let sql = r#"
            UPDATE orders
            SET fulfillment_status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .bind(fulfillment_status)
            .fetch_one(&mut **tx)
            .await
    }

    /// Cancel order within a database transaction
    pub async fn cancel_with_tx<'a>(tx: &mut DbTransaction<'a>, id: &str) -> Result<Order> {
        let sql = r#"
            UPDATE orders
            SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .fetch_one(&mut **tx)
            .await
    }

    /// Find orders by customer within a database transaction
    pub async fn find_by_customer_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        customer_id: &str,
    ) -> Result<Vec<Order>> {
        let sql = "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, Order>(sql)
            .bind(customer_id)
            .fetch_all(&mut **tx)
            .await
    }
}
