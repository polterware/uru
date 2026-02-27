//! Shop-scoped Transaction Service for Multi-Database Architecture

use crate::features::transaction::dtos::transaction_dto::{CreateTransactionDTO, UpdateTransactionDTO};
use crate::features::transaction::models::transaction_model::Transaction;
use crate::features::transaction::repositories::shop_transaction_repository::ShopTransactionRepository;
use sqlx::AnyPool;
use std::sync::Arc;

pub struct ShopTransactionService {
    pool: Arc<AnyPool>,
    shop_id: String,
    repo: ShopTransactionRepository,
}

impl ShopTransactionService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopTransactionRepository::new(pool.clone(), shop_id.clone());
        Self {
            pool,
            shop_id,
            repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub fn pool(&self) -> Arc<AnyPool> {
        self.pool.clone()
    }

    pub async fn create_transaction(&self, payload: CreateTransactionDTO) -> Result<Transaction, String> {
        let (transaction, items) = payload.into_models();

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        // Create the transaction
        let sql = r#"
            INSERT INTO transactions (
                id, type, status, channel, customer_id, supplier_id, staff_id,
                currency, total_items, total_shipping, total_discount, total_net,
                shipping_method, shipping_address, billing_address, _status,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
            )
        "#;

        sqlx::query(sql)
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
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to create transaction: {}", e))?;

        // Create transaction items
        for item in items {
            let item_sql = r#"
                INSERT INTO transaction_items (
                    id, transaction_id, product_id, sku_snapshot, name_snapshot,
                    quantity, unit_price, unit_cost, attributes_snapshot, tax_details,
                    _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#;

            sqlx::query(item_sql)
                .bind(&item.id)
                .bind(&item.transaction_id)
                .bind(&item.product_id)
                .bind(&item.sku_snapshot)
                .bind(&item.name_snapshot)
                .bind(item.quantity)
                .bind(item.unit_price)
                .bind(&item.unit_cost)
                .bind(&item.attributes_snapshot)
                .bind(&item.tax_details)
                .bind(&item.sync_status)
                .bind(&item.created_at)
                .bind(&item.updated_at)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to create transaction item: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        self.repo
            .get_by_id(&transaction.id)
            .await
            .map_err(|e| format!("Failed to fetch created transaction: {}", e))?
            .ok_or_else(|| "Created transaction not found".to_string())
    }

    pub async fn update_transaction(&self, payload: UpdateTransactionDTO) -> Result<Transaction, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch transaction: {}", e))?
            .ok_or_else(|| format!("Transaction not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update transaction: {}", e))
    }

    pub async fn delete_transaction(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete transaction: {}", e))
    }

    pub async fn get_transaction(&self, id: &str) -> Result<Option<Transaction>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch transaction: {}", e))
    }

    pub async fn list_transactions(&self) -> Result<Vec<Transaction>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list transactions: {}", e))
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Transaction, String> {
        self.repo
            .update_status(id, status)
            .await
            .map_err(|e| format!("Failed to update transaction status: {}", e))
    }

    pub async fn cancel_transaction(&self, id: &str) -> Result<Transaction, String> {
        self.update_status(id, "cancelled").await
    }

    pub async fn complete_sale(&self, id: &str, _location_id: &str) -> Result<Transaction, String> {
        self.update_status(id, "completed").await
    }
}
