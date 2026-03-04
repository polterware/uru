use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Checkout {
    pub id: String,
    pub shop_id: Option<String>,
    pub token: String,
    pub user_id: Option<String>,
    pub email: Option<String>,
    pub items: Option<String>,                  // JSONB stored as TEXT
    pub shipping_address: Option<String>,       // JSONB stored as TEXT
    pub billing_address: Option<String>,        // JSONB stored as TEXT
    pub shipping_line: Option<String>,          // JSONB stored as TEXT
    pub applied_discount_codes: Option<String>, // JSONB stored as TEXT
    pub currency: Option<String>,               // DEFAULT 'BRL'
    pub subtotal_price: Option<i64>,            // centavos
    pub total_tax: Option<i64>,                 // centavos
    pub total_shipping: Option<i64>,            // centavos
    pub total_discounts: Option<i64>,           // centavos
    pub total_price: Option<i64>,               // centavos
    pub status: Option<String>,                 // DEFAULT 'open'
    pub reservation_expires_at: Option<String>,
    pub completed_at: Option<String>,
    pub metadata: Option<String>, // JSONB stored as TEXT
    pub recovery_url: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
