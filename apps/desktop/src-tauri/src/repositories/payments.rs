use crate::models::payment::Payment;
use sqlx::{Result, SqlitePool};

pub struct PaymentsRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> PaymentsRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, payment: Payment) -> Result<Payment> {
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
            .bind(payment.id)                      // $1
            .bind(payment.transaction_id)          // $2
            .bind(payment.amount)                  // $3
            .bind(payment.currency)                // $4
            .bind(payment.provider)                // $5
            .bind(payment.method)                  // $6
            .bind(payment.installments)            // $7
            .bind(payment.status)                  // $8
            .bind(payment.provider_transaction_id) // $9
            .bind(payment.authorization_code)      // $10
            .bind(payment.payment_details)         // $11
            .bind(payment.risk_level)              // $12
            .bind(payment.sync_status)             // $13
            .bind(payment.created_at)              // $14
            .bind(payment.updated_at)              // $15
            .bind(payment.authorized_at)           // $16
            .bind(payment.captured_at)             // $17
            .bind(payment.voided_at)               // $18
            .fetch_one(self.pool)
            .await
    }

    pub async fn update(&self, payment: Payment) -> Result<Payment> {
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
                created_at = $14,
                updated_at = $15,
                authorized_at = $16,
                captured_at = $17,
                voided_at = $18
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Payment>(sql)
            .bind(payment.id)                      // $1
            .bind(payment.transaction_id)          // $2
            .bind(payment.amount)                  // $3
            .bind(payment.currency)                // $4
            .bind(payment.provider)                // $5
            .bind(payment.method)                  // $6
            .bind(payment.installments)            // $7
            .bind(payment.status)                  // $8
            .bind(payment.provider_transaction_id) // $9
            .bind(payment.authorization_code)      // $10
            .bind(payment.payment_details)         // $11
            .bind(payment.risk_level)              // $12
            .bind(payment.sync_status)             // $13
            .bind(payment.created_at)              // $14
            .bind(payment.updated_at)              // $15
            .bind(payment.authorized_at)           // $16
            .bind(payment.captured_at)             // $17
            .bind(payment.voided_at)               // $18
            .fetch_one(self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Payment>> {
        let sql = "SELECT * FROM payments WHERE id = $1";
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_optional(self.pool)
            .await
    }

    pub async fn list_by_transaction(&self, transaction_id: &str) -> Result<Vec<Payment>> {
        let sql = "SELECT * FROM payments WHERE transaction_id = $1";
        sqlx::query_as::<_, Payment>(sql)
            .bind(transaction_id)
            .fetch_all(self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM payments WHERE id = $1";
        sqlx::query(sql)
            .bind(id)
            .execute(self.pool)
            .await?;
        Ok(())
    }
}
