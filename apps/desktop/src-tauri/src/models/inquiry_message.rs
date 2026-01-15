use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct InquiryMessage {
    pub id: String,
    pub inquiry_id: String,
    pub sender_type: String, // 'customer', 'staff', 'bot'
    pub sender_id: Option<String>,
    pub body: Option<String>,
    pub is_internal_note: Option<bool>,
    pub attachments: Option<String>, // JSONB string
    pub external_id: Option<String>,
    pub read_at: Option<DateTime<Utc>>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
