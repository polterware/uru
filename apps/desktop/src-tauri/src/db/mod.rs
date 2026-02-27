//! Database module for multi-database architecture
//!
//! This module provides:
//! - PoolManager: Manages registry and shop database pools
//! - DatabaseError: Unified error handling
//! - Repository traits: Base traits for database operations
//! - Migration service: Handles schema migrations

pub mod error;
pub mod migrations;
pub mod pool_manager;
pub mod repository_factory;
pub mod traits;
pub mod types;

// Re-exports for convenience
pub use error::DatabaseError;
pub use migrations::MigrationService;
pub use pool_manager::PoolManager;
pub use repository_factory::RepositoryFactory;
pub use traits::*;
pub use types::*;

// Type aliases for the multi-database architecture
use sqlx::{Any, Transaction};

/// Type alias for the shop database pool (AnyPool — dispatches to SQLite or Postgres)
pub type DbPool = sqlx::AnyPool;

/// Type alias for a shop database transaction
pub type DbTransaction<'a> = Transaction<'a, Any>;
