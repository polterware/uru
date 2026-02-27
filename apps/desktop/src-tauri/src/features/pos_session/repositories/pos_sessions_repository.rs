use crate::features::pos_session::models::pos_session_model::PosSession;
use sqlx::{Result, AnyPool};

pub struct PosSessionsRepository {
    pool: AnyPool,
}

impl PosSessionsRepository {
    pub fn new(pool: AnyPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, session: PosSession) -> Result<PosSession> {
        let sql = r#"
            INSERT INTO pos_sessions (
                id, shop_id, location_id, operator_id, terminal_id, session_number,
                status, opening_cash_amount, opening_notes, opened_at,
                closing_cash_amount, closing_notes, closed_at, closed_by,
                total_sales, total_returns, total_cash_in, total_cash_out,
                transaction_count, expected_cash_amount, cash_difference,
                metadata, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING *
        "#;

        sqlx::query_as::<_, PosSession>(sql)
            .bind(&session.id)
            .bind(&session.shop_id)
            .bind(&session.location_id)
            .bind(&session.operator_id)
            .bind(&session.terminal_id)
            .bind(session.session_number)
            .bind(&session.status)
            .bind(session.opening_cash_amount)
            .bind(&session.opening_notes)
            .bind(session.opened_at)
            .bind(session.closing_cash_amount)
            .bind(&session.closing_notes)
            .bind(session.closed_at)
            .bind(&session.closed_by)
            .bind(session.total_sales)
            .bind(session.total_returns)
            .bind(session.total_cash_in)
            .bind(session.total_cash_out)
            .bind(session.transaction_count)
            .bind(session.expected_cash_amount)
            .bind(session.cash_difference)
            .bind(&session.metadata)
            .bind(&session.sync_status)
            .bind(session.created_at)
            .bind(session.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, session: PosSession) -> Result<PosSession> {
        let sql = r#"
            UPDATE pos_sessions SET
                terminal_id = $2,
                status = $3,
                opening_notes = $4,
                closing_cash_amount = $5,
                closing_notes = $6,
                closed_at = $7,
                closed_by = $8,
                total_sales = $9,
                total_returns = $10,
                total_cash_in = $11,
                total_cash_out = $12,
                transaction_count = $13,
                expected_cash_amount = $14,
                cash_difference = $15,
                metadata = $16,
                _status = $17,
                updated_at = $18
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, PosSession>(sql)
            .bind(&session.id)
            .bind(&session.terminal_id)
            .bind(&session.status)
            .bind(&session.opening_notes)
            .bind(session.closing_cash_amount)
            .bind(&session.closing_notes)
            .bind(session.closed_at)
            .bind(&session.closed_by)
            .bind(session.total_sales)
            .bind(session.total_returns)
            .bind(session.total_cash_in)
            .bind(session.total_cash_out)
            .bind(session.transaction_count)
            .bind(session.expected_cash_amount)
            .bind(session.cash_difference)
            .bind(&session.metadata)
            .bind(&session.sync_status)
            .bind(session.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<PosSession>> {
        let sql = "SELECT * FROM pos_sessions WHERE id = $1";

        sqlx::query_as::<_, PosSession>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<PosSession>> {
        let sql = "SELECT * FROM pos_sessions ORDER BY created_at DESC";

        sqlx::query_as::<_, PosSession>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<PosSession>> {
        let sql = "SELECT * FROM pos_sessions WHERE shop_id = $1 ORDER BY created_at DESC";

        sqlx::query_as::<_, PosSession>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn find_open_by_operator(&self, operator_id: &str) -> Result<Option<PosSession>> {
        let sql = "SELECT * FROM pos_sessions WHERE operator_id = $1 AND status = 'open'";

        sqlx::query_as::<_, PosSession>(sql)
            .bind(operator_id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_next_session_number(&self, shop_id: &str) -> Result<i32> {
        let sql = "SELECT COALESCE(MAX(session_number), 0) + 1 as next_number FROM pos_sessions WHERE shop_id = $1";

        let result: (i32,) = sqlx::query_as(sql)
            .bind(shop_id)
            .fetch_one(&self.pool)
            .await?;

        Ok(result.0)
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM pos_sessions WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;

        Ok(())
    }
}
