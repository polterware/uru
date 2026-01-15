use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct InventoryMovement {
    pub id: String,
    pub transaction_id: Option<String>,
    pub inventory_level_id: Option<String>,
    #[sqlx(rename = "type")]
    pub movement_type: Option<String>, // 'in' or 'out'
    pub quantity: f64,
    pub previous_balance: Option<f64>,
    pub new_balance: Option<f64>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
