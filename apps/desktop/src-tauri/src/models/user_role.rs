use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserRole {
    pub user_id: String,
    pub role_id: String,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub status_internal: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
