use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct TransactionItem {
    pub id: String,
    pub transaction_id: String,
    pub product_id: Option<String>,
    pub sku_snapshot: Option<String>,
    pub name_snapshot: Option<String>,
    pub quantity: f64,
    pub unit_price: f64,
    pub unit_cost: Option<f64>,
    pub total_line: Option<f64>, // Real Generated Always
    pub attributes_snapshot: Option<String>, // JSONB
    pub tax_details: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
