use chrono::{DateTime, String, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct InventoryLevel {
    pub id: String,
    pub product_id: String,
    pub location_id: String,
    pub batch_number: Option<String>,
    pub serial_number: Option<String>,
    pub expiry_date: Option<String>,
    pub quantity_on_hand: f64,        // DEFAULT 0
    pub quantity_reserved: f64,       // DEFAULT 0
    pub stock_status: Option<String>, // DEFAULT 'sellable' check constraint
    pub aisle_bin_slot: Option<String>,
    pub last_counted_at: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<String>, // DEFAULT CURRENT_TIMESTAMP
    pub updated_at: Option<String>, // DEFAULT CURRENT_TIMESTAMP
}
