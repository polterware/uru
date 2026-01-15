use crate::models::transaction_item::TransactionItem;
use sqlx::{Result, SqlitePool};

pub struct TransactionItemsRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> TransactionItemsRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: TransactionItem) -> Result<TransactionItem> {
        let sql = r#"
            INSERT INTO transaction_items (
                id, transaction_id, product_id, sku_snapshot, name_snapshot,
                quantity, unit_price, unit_cost, attributes_snapshot,
                tax_details, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        "#;

        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(item.id)                  // $1
            .bind(item.transaction_id)      // $2
            .bind(item.product_id)          // $3
            .bind(item.sku_snapshot)        // $4
            .bind(item.name_snapshot)       // $5
            .bind(item.quantity)            // $6
            .bind(item.unit_price)          // $7
            .bind(item.unit_cost)           // $8
            .bind(item.attributes_snapshot) // $9
            .bind(item.tax_details)         // $10
            .bind(item.sync_status)         // $11
            .bind(item.created_at)          // $12
            .bind(item.updated_at)          // $13
            .fetch_one(self.pool)
            .await
    }

    pub async fn update(&self, item: TransactionItem) -> Result<TransactionItem> {
        let sql = r#"
            UPDATE transaction_items SET
                transaction_id = $2,
                product_id = $3,
                sku_snapshot = $4,
                name_snapshot = $5,
                quantity = $6,
                unit_price = $7,
                unit_cost = $8,
                attributes_snapshot = $9,
                tax_details = $10,
                _status = $11,
                updated_at = $12
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(item.id)                  // $1
            .bind(item.transaction_id)      // $2
            .bind(item.product_id)          // $3
            .bind(item.sku_snapshot)        // $4
            .bind(item.name_snapshot)       // $5
            .bind(item.quantity)            // $6
            .bind(item.unit_price)          // $7
            .bind(item.unit_cost)           // $8
            .bind(item.attributes_snapshot) // $9
            .bind(item.tax_details)         // $10
            .bind(item.sync_status)         // $11
            .bind(item.updated_at)          // $12
            .fetch_one(self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<TransactionItem>> {
        let sql = r#"
            SELECT * FROM transaction_items WHERE id = $1
        "#;

        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(id)
            .fetch_optional(self.pool)
            .await
    }

    pub async fn list_by_transaction(&self, transaction_id: &str) -> Result<Vec<TransactionItem>> {
        let sql = r#"
            SELECT * FROM transaction_items WHERE transaction_id = $1
        "#;

        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(transaction_id)
            .fetch_all(self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = r#"
            DELETE FROM transaction_items WHERE id = $1
        "#;

        sqlx::query(sql)
            .bind(id)
            .execute(self.pool)
            .await?;

        Ok(())
    }
}
