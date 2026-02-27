//! Base repository traits for multi-database architecture
//!
//! These traits define the common interface that all repository implementations
//! must follow, allowing for polymorphic database access.

use crate::db::error::DbResult;
use async_trait::async_trait;
use sqlx::{Any, Transaction};

/// Marker trait for entities that can be stored in a database
pub trait Entity: Send + Sync + Clone {
    /// Get the entity's unique identifier
    fn id(&self) -> &str;
}

/// Base trait for all repositories
#[async_trait]
pub trait Repository: Send + Sync {
    /// The entity type this repository manages
    type Entity: Entity;

    /// Create a new entity
    async fn create(&self, entity: &Self::Entity) -> DbResult<Self::Entity>;

    /// Get an entity by ID
    async fn get_by_id(&self, id: &str) -> DbResult<Option<Self::Entity>>;

    /// List all entities (with optional pagination)
    async fn list(&self, limit: Option<i64>, offset: Option<i64>) -> DbResult<Vec<Self::Entity>>;

    /// Update an entity
    async fn update(&self, entity: &Self::Entity) -> DbResult<Self::Entity>;

    /// Soft delete an entity by ID
    async fn delete(&self, id: &str) -> DbResult<()>;
}

/// Trait for repositories that support transactions
#[async_trait]
pub trait TransactionalRepository: Repository {
    /// Create a new entity within a transaction
    async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Any>,
        entity: &Self::Entity,
    ) -> DbResult<Self::Entity>;

    /// Update an entity within a transaction
    async fn update_in_tx(
        &self,
        tx: &mut Transaction<'_, Any>,
        entity: &Self::Entity,
    ) -> DbResult<Self::Entity>;

    /// Soft delete an entity within a transaction
    async fn delete_in_tx(&self, tx: &mut Transaction<'_, Any>, id: &str) -> DbResult<()>;
}

/// Trait for registry-level repositories (shops, users, roles, modules)
///
/// Registry repositories always use SQLite and operate on the central registry database.
#[async_trait]
pub trait RegistryRepository: Repository {}

/// Trait for shop-level repositories (products, customers, orders, etc.)
///
/// Shop repositories operate on per-shop databases which can be SQLite or Postgres.
#[async_trait]
pub trait ShopRepository: Repository {
    /// Get the shop ID this repository is scoped to
    fn shop_id(&self) -> &str;
}

/// Helper trait for creating repositories from a pool
pub trait FromPool: Sized {
    /// Create a new repository instance from an AnyPool
    fn from_pool(pool: sqlx::AnyPool) -> Self;
}

/// Helper trait for creating shop-scoped repositories
pub trait FromPoolWithShop: Sized {
    /// Create a new repository instance scoped to a specific shop
    fn from_pool_with_shop(pool: sqlx::AnyPool, shop_id: String) -> Self;
}
