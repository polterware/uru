//! Unified database error handling

use thiserror::Error;

/// Unified database error type for all database operations
#[derive(Error, Debug)]
pub enum DatabaseError {
    /// SQLx database error
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),

    /// Pool not found for shop
    #[error("Database pool not found for shop: {0}")]
    PoolNotFound(String),

    /// Shop not found
    #[error("Shop not found: {0}")]
    ShopNotFound(String),

    /// Invalid database configuration
    #[error("Invalid database configuration: {0}")]
    InvalidConfig(String),

    /// Migration error
    #[error("Migration error: {0}")]
    Migration(String),

    /// Connection error
    #[error("Connection error: {0}")]
    Connection(String),

    /// Transaction error
    #[error("Transaction error: {0}")]
    Transaction(String),

    /// Record not found
    #[error("Record not found: {0}")]
    NotFound(String),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),

    /// IO error
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    /// JSON serialization error
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    /// Generic internal error
    #[error("Internal error: {0}")]
    Internal(String),
}

impl DatabaseError {
    /// Create a new pool not found error
    pub fn pool_not_found(shop_id: impl Into<String>) -> Self {
        Self::PoolNotFound(shop_id.into())
    }

    /// Create a new shop not found error
    pub fn shop_not_found(shop_id: impl Into<String>) -> Self {
        Self::ShopNotFound(shop_id.into())
    }

    /// Create a new invalid config error
    pub fn invalid_config(message: impl Into<String>) -> Self {
        Self::InvalidConfig(message.into())
    }

    /// Create a new migration error
    pub fn migration(message: impl Into<String>) -> Self {
        Self::Migration(message.into())
    }

    /// Create a new connection error
    pub fn connection(message: impl Into<String>) -> Self {
        Self::Connection(message.into())
    }

    /// Create a new not found error
    pub fn not_found(message: impl Into<String>) -> Self {
        Self::NotFound(message.into())
    }

    /// Create a new validation error
    pub fn validation(message: impl Into<String>) -> Self {
        Self::Validation(message.into())
    }

    /// Create a new internal error
    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal(message.into())
    }
}

/// Result type alias for database operations
pub type DbResult<T> = Result<T, DatabaseError>;

// Implement conversion to String for Tauri command compatibility
impl From<DatabaseError> for String {
    fn from(err: DatabaseError) -> String {
        err.to_string()
    }
}
