use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ShipmentEvent {
    pub id: String,
    pub shipment_id: Option<String>,
    pub status: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub happened_at: Option<DateTime<Utc>>,
    pub raw_data: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
