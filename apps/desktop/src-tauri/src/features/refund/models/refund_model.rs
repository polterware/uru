use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Refund {
    pub id: String,
    pub payment_id: String,
    pub amount: f64,
    pub status: String,
    pub reason: Option<String>,
    pub provider_refund_id: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub created_by: Option<String>,
}
