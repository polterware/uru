//! Shop-scoped Transaction Repository for Multi-Database Architecture

use crate::features::transaction::models::transaction_model::Transaction;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Any, AnyPool, FromRow, Result, Transaction as SqlxTransaction};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopTransaction {
    pub id: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub status: String,
    pub channel: Option<String>,
    pub customer_id: Option<String>,
    pub supplier_id: Option<String>,
    pub staff_id: Option<String>,
    pub currency: Option<String>,
    pub total_items: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_discount: Option<f64>,
    pub total_net: Option<f64>,
    pub shipping_method: Option<String>,
    pub shipping_address: Option<String>,
    pub billing_address: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl ShopTransaction {
    fn into_transaction(self, shop_id: String) -> Transaction {
        Transaction {
            id: self.id,
            shop_id,
            r#type: self.r#type,
            status: self.status,
            channel: self.channel,
            customer_id: self.customer_id,
            supplier_id: self.supplier_id,
            staff_id: self.staff_id,
            currency: self.currency,
            total_items: self.total_items,
            total_shipping: self.total_shipping,
            total_discount: self.total_discount,
            total_net: self.total_net,
            shipping_method: self.shipping_method,
            shipping_address: self.shipping_address,
            billing_address: self.billing_address,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

pub struct ShopTransactionRepository {
    pool: Arc<AnyPool>,
    shop_id: String,
}

impl ShopTransactionRepository {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, transaction: &Transaction) -> Result<Transaction> {
        let sql = r#"
            INSERT INTO transactions (
                id, type, status, channel, customer_id, supplier_id, staff_id,
                currency, total_items, total_shipping, total_discount, total_net,
                shipping_method, shipping_address, billing_address, _status,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
            )
            RETURNING *
        "#;

        let shop_tx = sqlx::query_as::<_, ShopTransaction>(sql)
            .bind(&transaction.id)
            .bind(&transaction.r#type)
            .bind(&transaction.status)
            .bind(&transaction.channel)
            .bind(&transaction.customer_id)
            .bind(&transaction.supplier_id)
            .bind(&transaction.staff_id)
            .bind(&transaction.currency)
            .bind(&transaction.total_items)
            .bind(&transaction.total_shipping)
            .bind(&transaction.total_discount)
            .bind(&transaction.total_net)
            .bind(&transaction.shipping_method)
            .bind(&transaction.shipping_address)
            .bind(&transaction.billing_address)
            .bind(&transaction.sync_status)
            .bind(&transaction.created_at)
            .bind(&transaction.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_tx.into_transaction(self.shop_id.clone()))
    }

    pub async fn update(&self, transaction: &Transaction) -> Result<Transaction> {
        let sql = r#"
            UPDATE transactions SET
                type = $2, status = $3, channel = $4, customer_id = $5, supplier_id = $6,
                staff_id = $7, currency = $8, total_items = $9, total_shipping = $10,
                total_discount = $11, total_net = $12, shipping_method = $13,
                shipping_address = $14, billing_address = $15, _status = $16, updated_at = $17
            WHERE id = $1
            RETURNING *
        "#;

        let shop_tx = sqlx::query_as::<_, ShopTransaction>(sql)
            .bind(&transaction.id)
            .bind(&transaction.r#type)
            .bind(&transaction.status)
            .bind(&transaction.channel)
            .bind(&transaction.customer_id)
            .bind(&transaction.supplier_id)
            .bind(&transaction.staff_id)
            .bind(&transaction.currency)
            .bind(&transaction.total_items)
            .bind(&transaction.total_shipping)
            .bind(&transaction.total_discount)
            .bind(&transaction.total_net)
            .bind(&transaction.shipping_method)
            .bind(&transaction.shipping_address)
            .bind(&transaction.billing_address)
            .bind(&transaction.sync_status)
            .bind(&transaction.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_tx.into_transaction(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Transaction>> {
        let sql = "SELECT * FROM transactions WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopTransaction>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|t| t.into_transaction(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Transaction>> {
        let sql = "SELECT * FROM transactions WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopTransaction>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|t| t.into_transaction(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE transactions SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Transaction> {
        let sql = r#"
            UPDATE transactions SET status = $2, _status = 'modified', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_tx = sqlx::query_as::<_, ShopTransaction>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_tx.into_transaction(self.shop_id.clone()))
    }

    pub async fn get_by_id_in_tx(
        tx: &mut SqlxTransaction<'_, Any>,
        id: &str,
        shop_id: String,
    ) -> Result<Option<Transaction>> {
        let sql = "SELECT * FROM transactions WHERE id = $1";
        let result = sqlx::query_as::<_, ShopTransaction>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await?;

        Ok(result.map(|t| t.into_transaction(shop_id)))
    }
}
