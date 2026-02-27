use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct PosSession {
    pub id: String,
    pub shop_id: String,
    pub location_id: Option<String>,
    pub operator_id: String,
    pub terminal_id: Option<String>,
    pub session_number: Option<i32>,
    pub status: Option<String>, // 'open', 'paused', 'closed', 'cancelled'

    // Opening values
    pub opening_cash_amount: Option<f64>,
    pub opening_notes: Option<String>,
    pub opened_at: Option<String>,

    // Closing values
    pub closing_cash_amount: Option<f64>,
    pub closing_notes: Option<String>,
    pub closed_at: Option<String>,
    pub closed_by: Option<String>,

    // Session totals
    pub total_sales: Option<f64>,
    pub total_returns: Option<f64>,
    pub total_cash_in: Option<f64>,
    pub total_cash_out: Option<f64>,
    pub transaction_count: Option<i32>,

    // Cash difference
    pub expected_cash_amount: Option<f64>,
    pub cash_difference: Option<f64>,

    pub metadata: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
