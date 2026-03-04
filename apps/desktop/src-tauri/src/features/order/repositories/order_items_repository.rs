use crate::db::DbTransaction;
use crate::features::order::models::order_item_model::OrderItem;
use sqlx::{AnyPool, Result};

pub struct OrderItemsRepository {
    pool: AnyPool,
}

impl OrderItemsRepository {
    pub fn new(pool: AnyPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: OrderItem) -> Result<OrderItem> {
        let sql = r#"
            INSERT INTO order_items (
                id, order_id, product_id, name, image_url, price, quantity,
                size, sku_snapshot, attributes_snapshot, shipping_snapshot,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        "#;

        sqlx::query_as::<_, OrderItem>(sql)
            .bind(&item.id)
            .bind(&item.order_id)
            .bind(&item.product_id)
            .bind(&item.name)
            .bind(&item.image_url)
            .bind(item.price)
            .bind(item.quantity)
            .bind(&item.size)
            .bind(&item.sku_snapshot)
            .bind(&item.attributes_snapshot)
            .bind(&item.shipping_snapshot)
            .bind(&item.sync_status)
            .bind(&item.created_at)
            .bind(&item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_order_id(&self, order_id: &str) -> Result<Vec<OrderItem>> {
        let sql = "SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC";

        sqlx::query_as::<_, OrderItem>(sql)
            .bind(order_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<OrderItem>> {
        let sql = "SELECT * FROM order_items WHERE id = $1";

        sqlx::query_as::<_, OrderItem>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn delete_by_order_id(&self, order_id: &str) -> Result<()> {
        let sql = "DELETE FROM order_items WHERE order_id = $1";
        sqlx::query(sql).bind(order_id).execute(&self.pool).await?;
        Ok(())
    }

    // Transaction-aware methods

    pub async fn create_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        item: OrderItem,
    ) -> Result<OrderItem> {
        let sql = r#"
            INSERT INTO order_items (
                id, order_id, product_id, name, image_url, price, quantity,
                size, sku_snapshot, attributes_snapshot, shipping_snapshot,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        "#;

        sqlx::query_as::<_, OrderItem>(sql)
            .bind(&item.id)
            .bind(&item.order_id)
            .bind(&item.product_id)
            .bind(&item.name)
            .bind(&item.image_url)
            .bind(item.price)
            .bind(item.quantity)
            .bind(&item.size)
            .bind(&item.sku_snapshot)
            .bind(&item.attributes_snapshot)
            .bind(&item.shipping_snapshot)
            .bind(&item.sync_status)
            .bind(&item.created_at)
            .bind(&item.updated_at)
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn find_by_order_id_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        order_id: &str,
    ) -> Result<Vec<OrderItem>> {
        let sql = "SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC";
        sqlx::query_as::<_, OrderItem>(sql)
            .bind(order_id)
            .fetch_all(&mut **tx)
            .await
    }
}
