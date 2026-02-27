//! Shop-scoped POS Session Repository for Multi-Database Architecture

use crate::features::pos_session::models::pos_session_model::PosSession;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, AnyPool};
use std::sync::Arc;

/// Internal struct for shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopPosSession {
    pub id: String,
    pub location_id: Option<String>,
    pub operator_id: String,
    pub terminal_id: Option<String>,
    pub session_number: Option<i32>,
    pub status: Option<String>,
    pub opening_cash_amount: Option<f64>,
    pub opening_notes: Option<String>,
    pub opened_at: Option<String>,
    pub closing_cash_amount: Option<f64>,
    pub closing_notes: Option<String>,
    pub closed_at: Option<String>,
    pub closed_by: Option<String>,
    pub total_sales: Option<f64>,
    pub total_returns: Option<f64>,
    pub total_cash_in: Option<f64>,
    pub total_cash_out: Option<f64>,
    pub transaction_count: Option<i32>,
    pub expected_cash_amount: Option<f64>,
    pub cash_difference: Option<f64>,
    pub metadata: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl ShopPosSession {
    fn into_pos_session(self, shop_id: String) -> PosSession {
        PosSession {
            id: self.id,
            shop_id,
            location_id: self.location_id,
            operator_id: self.operator_id,
            terminal_id: self.terminal_id,
            session_number: self.session_number,
            status: self.status,
            opening_cash_amount: self.opening_cash_amount,
            opening_notes: self.opening_notes,
            opened_at: self.opened_at,
            closing_cash_amount: self.closing_cash_amount,
            closing_notes: self.closing_notes,
            closed_at: self.closed_at,
            closed_by: self.closed_by,
            total_sales: self.total_sales,
            total_returns: self.total_returns,
            total_cash_in: self.total_cash_in,
            total_cash_out: self.total_cash_out,
            transaction_count: self.transaction_count,
            expected_cash_amount: self.expected_cash_amount,
            cash_difference: self.cash_difference,
            metadata: self.metadata,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

pub struct ShopPosSessionRepository {
    pool: Arc<AnyPool>,
    shop_id: String,
}

impl ShopPosSessionRepository {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, session: &PosSession) -> Result<PosSession> {
        let sql = r#"
            INSERT INTO pos_sessions (
                id, location_id, operator_id, terminal_id, session_number,
                status, opening_cash_amount, opening_notes, opened_at,
                closing_cash_amount, closing_notes, closed_at, closed_by,
                total_sales, total_returns, total_cash_in, total_cash_out,
                transaction_count, expected_cash_amount, cash_difference,
                metadata, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING *
        "#;

        let shop_session = sqlx::query_as::<_, ShopPosSession>(sql)
            .bind(&session.id)
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
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_session.into_pos_session(self.shop_id.clone()))
    }

    pub async fn update(&self, session: &PosSession) -> Result<PosSession> {
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

        let shop_session = sqlx::query_as::<_, ShopPosSession>(sql)
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
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_session.into_pos_session(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<PosSession>> {
        let sql = "SELECT * FROM pos_sessions WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopPosSession>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|s| s.into_pos_session(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<PosSession>> {
        let sql = "SELECT * FROM pos_sessions WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopPosSession>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|s| s.into_pos_session(self.shop_id.clone()))
            .collect())
    }

    pub async fn find_open_by_operator(&self, operator_id: &str) -> Result<Option<PosSession>> {
        let sql = "SELECT * FROM pos_sessions WHERE operator_id = $1 AND status = 'open' AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopPosSession>(sql)
            .bind(operator_id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|s| s.into_pos_session(self.shop_id.clone())))
    }

    pub async fn get_next_session_number(&self) -> Result<i32> {
        let sql = "SELECT COALESCE(MAX(session_number), 0) + 1 as next_number FROM pos_sessions";
        let result: (i32,) = sqlx::query_as(sql)
            .fetch_one(&*self.pool)
            .await?;

        Ok(result.0)
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE pos_sessions SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }
}
