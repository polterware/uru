//! Shop-scoped Refund Service for Multi-Database Architecture

use crate::features::refund::models::refund_model::Refund;
use crate::features::refund::repositories::shop_refund_repository::ShopRefundRepository;
use sqlx::SqlitePool;
use std::sync::Arc;

pub struct ShopRefundService {
    pool: Arc<SqlitePool>,
    repo: ShopRefundRepository,
}

impl ShopRefundService {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        let repo = ShopRefundRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn list_refunds(&self) -> Result<Vec<Refund>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list refunds: {}", e))
    }

    pub async fn get_refund(&self, id: &str) -> Result<Option<Refund>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get refund: {}", e))
    }

    pub async fn list_by_payment(&self, payment_id: &str) -> Result<Vec<Refund>, String> {
        self.repo
            .list_by_payment(payment_id)
            .await
            .map_err(|e| format!("Failed to list refunds by payment: {}", e))
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Refund, String> {
        self.repo
            .update_status(id, status)
            .await
            .map_err(|e| format!("Failed to update refund status: {}", e))
    }
}
