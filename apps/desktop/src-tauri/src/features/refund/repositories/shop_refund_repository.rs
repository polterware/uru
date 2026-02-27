//! Shop-scoped Refund Repository for Multi-Database Architecture

use crate::features::refund::models::refund_model::Refund;
use sqlx::{Result, AnyPool};
use std::sync::Arc;

pub struct ShopRefundRepository {
    pool: Arc<AnyPool>,
}

impl ShopRefundRepository {
    pub fn new(pool: Arc<AnyPool>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, refund: &Refund) -> Result<Refund> {
        let sql = r#"
            INSERT INTO refunds (
                id, payment_id, amount, status, reason,
                provider_refund_id, _status, created_at, updated_at, created_by
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Refund>(sql)
            .bind(&refund.id)
            .bind(&refund.payment_id)
            .bind(refund.amount)
            .bind(&refund.status)
            .bind(&refund.reason)
            .bind(&refund.provider_refund_id)
            .bind(&refund.sync_status)
            .bind(&refund.created_at)
            .bind(&refund.updated_at)
            .bind(&refund.created_by)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn update(&self, refund: &Refund) -> Result<Refund> {
        let sql = r#"
            UPDATE refunds SET
                payment_id = $2,
                amount = $3,
                status = $4,
                reason = $5,
                provider_refund_id = $6,
                _status = $7,
                updated_at = $8,
                created_by = $9
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Refund>(sql)
            .bind(&refund.id)
            .bind(&refund.payment_id)
            .bind(refund.amount)
            .bind(&refund.status)
            .bind(&refund.reason)
            .bind(&refund.provider_refund_id)
            .bind(&refund.sync_status)
            .bind(&refund.updated_at)
            .bind(&refund.created_by)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Refund>> {
        let sql = "SELECT * FROM refunds WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, Refund>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Refund>> {
        let sql = "SELECT * FROM refunds WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        sqlx::query_as::<_, Refund>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_payment(&self, payment_id: &str) -> Result<Vec<Refund>> {
        let sql = "SELECT * FROM refunds WHERE payment_id = $1 AND (_status IS NULL OR _status != 'deleted') ORDER BY created_at DESC";
        sqlx::query_as::<_, Refund>(sql)
            .bind(payment_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE refunds SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Refund> {
        let sql = r#"
            UPDATE refunds
            SET status = $2, _status = 'modified', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Refund>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await
    }
}
