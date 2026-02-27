//! Shop-scoped Payment Repository for Multi-Database Architecture

use crate::features::payment::models::payment_model::Payment;
use sqlx::{Result, AnyPool};
use std::sync::Arc;

pub struct ShopPaymentRepository {
    pool: Arc<AnyPool>,
}

impl ShopPaymentRepository {
    pub fn new(pool: Arc<AnyPool>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, payment: &Payment) -> Result<Payment> {
        let sql = r#"
            INSERT INTO payments (
                id, transaction_id, amount, currency, provider, method,
                installments, status, provider_transaction_id, authorization_code,
                payment_details, risk_level, _status, created_at, updated_at,
                authorized_at, captured_at, voided_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Payment>(sql)
            .bind(&payment.id)
            .bind(&payment.transaction_id)
            .bind(payment.amount)
            .bind(&payment.currency)
            .bind(&payment.provider)
            .bind(&payment.method)
            .bind(payment.installments)
            .bind(&payment.status)
            .bind(&payment.provider_transaction_id)
            .bind(&payment.authorization_code)
            .bind(&payment.payment_details)
            .bind(&payment.risk_level)
            .bind(&payment.sync_status)
            .bind(&payment.created_at)
            .bind(&payment.updated_at)
            .bind(&payment.authorized_at)
            .bind(&payment.captured_at)
            .bind(&payment.voided_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn update(&self, payment: &Payment) -> Result<Payment> {
        let sql = r#"
            UPDATE payments SET
                transaction_id = $2,
                amount = $3,
                currency = $4,
                provider = $5,
                method = $6,
                installments = $7,
                status = $8,
                provider_transaction_id = $9,
                authorization_code = $10,
                payment_details = $11,
                risk_level = $12,
                _status = $13,
                updated_at = $14,
                authorized_at = $15,
                captured_at = $16,
                voided_at = $17
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Payment>(sql)
            .bind(&payment.id)
            .bind(&payment.transaction_id)
            .bind(payment.amount)
            .bind(&payment.currency)
            .bind(&payment.provider)
            .bind(&payment.method)
            .bind(payment.installments)
            .bind(&payment.status)
            .bind(&payment.provider_transaction_id)
            .bind(&payment.authorization_code)
            .bind(&payment.payment_details)
            .bind(&payment.risk_level)
            .bind(&payment.sync_status)
            .bind(&payment.updated_at)
            .bind(&payment.authorized_at)
            .bind(&payment.captured_at)
            .bind(&payment.voided_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Payment>> {
        let sql = "SELECT * FROM payments WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Payment>> {
        let sql = "SELECT * FROM payments WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        sqlx::query_as::<_, Payment>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_transaction(&self, transaction_id: &str) -> Result<Vec<Payment>> {
        let sql = "SELECT * FROM payments WHERE transaction_id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, Payment>(sql)
            .bind(transaction_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE payments SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Payment> {
        let sql = r#"
            UPDATE payments SET status = $2, _status = 'modified', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn capture(&self, id: &str) -> Result<Payment> {
        let sql = r#"
            UPDATE payments
            SET status = 'captured',
                captured_at = CURRENT_TIMESTAMP,
                _status = 'modified',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn void(&self, id: &str) -> Result<Payment> {
        let sql = r#"
            UPDATE payments
            SET status = 'voided',
                voided_at = CURRENT_TIMESTAMP,
                _status = 'modified',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_refunded_amount(&self, payment_id: &str) -> Result<f64> {
        let sql = r#"
            SELECT COALESCE(SUM(amount), 0) as total
            FROM refunds
            WHERE payment_id = $1 AND status = 'completed'
        "#;
        let result: (f64,) = sqlx::query_as(sql)
            .bind(payment_id)
            .fetch_one(&*self.pool)
            .await?;
        Ok(result.0)
    }
}
