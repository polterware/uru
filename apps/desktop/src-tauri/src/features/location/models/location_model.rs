use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Location {
    pub id: String,
    pub shop_id: String, // Multi-tenancy
    pub name: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub type_: String, // warehouse, store, transit, virtual
    pub is_sellable: bool,
    pub address_data: Option<String>, // JSONB stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
