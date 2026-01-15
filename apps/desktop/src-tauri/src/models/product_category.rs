use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProductCategory {
    pub product_id: String,
    pub category_id: String,
    pub position: Option<i64>,
    #[sqlx(rename = "_status")]
    pub status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
