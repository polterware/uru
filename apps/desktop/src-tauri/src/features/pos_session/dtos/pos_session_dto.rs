use crate::features::pos_session::models::pos_session_model::PosSession;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePosSessionDTO {
    pub shop_id: String,
    pub location_id: Option<String>,
    pub operator_id: String,
    pub terminal_id: Option<String>,
    pub opening_cash_amount: Option<f64>,
    pub opening_notes: Option<String>,
    pub metadata: Option<String>,
}

impl CreatePosSessionDTO {
    pub fn into_model(self) -> PosSession {
        let now = Utc::now();

        PosSession {
            id: Uuid::new_v4().to_string(),
            shop_id: self.shop_id,
            location_id: self.location_id,
            operator_id: self.operator_id,
            terminal_id: self.terminal_id,
            session_number: None, // Will be set by the service
            status: Some("open".to_string()),
            opening_cash_amount: self.opening_cash_amount.or(Some(0.0)),
            opening_notes: self.opening_notes,
            opened_at: Some(now),
            closing_cash_amount: None,
            closing_notes: None,
            closed_at: None,
            closed_by: None,
            total_sales: Some(0.0),
            total_returns: Some(0.0),
            total_cash_in: Some(0.0),
            total_cash_out: Some(0.0),
            transaction_count: Some(0),
            expected_cash_amount: None,
            cash_difference: None,
            metadata: self.metadata,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePosSessionDTO {
    pub id: String,
    pub terminal_id: Option<String>,
    pub opening_notes: Option<String>,
    pub total_sales: Option<f64>,
    pub total_returns: Option<f64>,
    pub total_cash_in: Option<f64>,
    pub total_cash_out: Option<f64>,
    pub transaction_count: Option<i32>,
    pub metadata: Option<String>,
}

impl UpdatePosSessionDTO {
    pub fn apply_to_session(self, existing: PosSession) -> PosSession {
        let now = Utc::now();

        PosSession {
            id: existing.id,
            shop_id: existing.shop_id,
            location_id: existing.location_id,
            operator_id: existing.operator_id,
            terminal_id: self.terminal_id.or(existing.terminal_id),
            session_number: existing.session_number,
            status: existing.status,
            opening_cash_amount: existing.opening_cash_amount,
            opening_notes: self.opening_notes.or(existing.opening_notes),
            opened_at: existing.opened_at,
            closing_cash_amount: existing.closing_cash_amount,
            closing_notes: existing.closing_notes,
            closed_at: existing.closed_at,
            closed_by: existing.closed_by,
            total_sales: self.total_sales.or(existing.total_sales),
            total_returns: self.total_returns.or(existing.total_returns),
            total_cash_in: self.total_cash_in.or(existing.total_cash_in),
            total_cash_out: self.total_cash_out.or(existing.total_cash_out),
            transaction_count: self.transaction_count.or(existing.transaction_count),
            expected_cash_amount: existing.expected_cash_amount,
            cash_difference: existing.cash_difference,
            metadata: self.metadata.or(existing.metadata),
            sync_status: Some("updated".to_string()),
            created_at: existing.created_at,
            updated_at: Some(now),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClosePosSessionDTO {
    pub id: String,
    pub closing_cash_amount: f64,
    pub closing_notes: Option<String>,
    pub closed_by: String,
}

impl ClosePosSessionDTO {
    pub fn apply_to_session(self, existing: PosSession) -> PosSession {
        let now = Utc::now();

        // Calculate expected cash amount
        let opening = existing.opening_cash_amount.unwrap_or(0.0);
        let sales = existing.total_sales.unwrap_or(0.0);
        let returns = existing.total_returns.unwrap_or(0.0);
        let cash_in = existing.total_cash_in.unwrap_or(0.0);
        let cash_out = existing.total_cash_out.unwrap_or(0.0);
        let expected_cash = opening + sales - returns + cash_in - cash_out;
        let cash_difference = self.closing_cash_amount - expected_cash;

        PosSession {
            id: existing.id,
            shop_id: existing.shop_id,
            location_id: existing.location_id,
            operator_id: existing.operator_id,
            terminal_id: existing.terminal_id,
            session_number: existing.session_number,
            status: Some("closed".to_string()),
            opening_cash_amount: existing.opening_cash_amount,
            opening_notes: existing.opening_notes,
            opened_at: existing.opened_at,
            closing_cash_amount: Some(self.closing_cash_amount),
            closing_notes: self.closing_notes,
            closed_at: Some(now),
            closed_by: Some(self.closed_by),
            total_sales: existing.total_sales,
            total_returns: existing.total_returns,
            total_cash_in: existing.total_cash_in,
            total_cash_out: existing.total_cash_out,
            transaction_count: existing.transaction_count,
            expected_cash_amount: Some(expected_cash),
            cash_difference: Some(cash_difference),
            metadata: existing.metadata,
            sync_status: Some("updated".to_string()),
            created_at: existing.created_at,
            updated_at: Some(now),
        }
    }
}
