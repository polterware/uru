//! Pool manager for multi-database architecture
//!
//! Manages the registry database pool (always SQLite) and
//! lazy-loaded shop database pools (SQLite or Postgres).

use crate::db::error::{DatabaseError, DbResult};
use crate::db::types::{DatabaseConfig, DatabaseType};
use dashmap::DashMap;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

/// Manages database connection pools for the multi-database architecture.
///
/// The PoolManager handles:
/// - A single registry database (always SQLite) for shops, users, roles, modules
/// - Per-shop databases that are lazy-loaded on first access
pub struct PoolManager {
    /// Registry database pool (always SQLite)
    registry_pool: SqlitePool,
    /// Shop database pools, keyed by shop_id
    shop_pools: DashMap<String, Arc<SqlitePool>>,
    /// Application data directory for SQLite database files
    data_dir: PathBuf,
}

impl PoolManager {
    /// Create a new PoolManager with the given registry pool and data directory.
    pub fn new(registry_pool: SqlitePool, data_dir: PathBuf) -> Self {
        Self {
            registry_pool,
            shop_pools: DashMap::new(),
            data_dir,
        }
    }

    /// Initialize the PoolManager by creating the registry database.
    ///
    /// This should be called during application startup.
    pub async fn initialize(data_dir: PathBuf) -> DbResult<Self> {
        std::fs::create_dir_all(&data_dir)?;

        let registry_path = data_dir.join("registry.db");
        let registry_url = format!(
            "sqlite:{}?mode=rwc",
            registry_path.to_string_lossy().replace(' ', "%20")
        );

        let connect_options = SqliteConnectOptions::from_str(&registry_url)
            .map_err(|e| DatabaseError::connection(e.to_string()))?
            .create_if_missing(true)
            .foreign_keys(true);

        let registry_pool = SqlitePoolOptions::new()
            .max_connections(5)
            .min_connections(1)
            .acquire_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600))
            .connect_with(connect_options)
            .await?;

        Ok(Self::new(registry_pool, data_dir))
    }

    /// Get a reference to the registry database pool.
    ///
    /// The registry database contains: shops, users, roles, modules, shop_templates
    pub fn registry(&self) -> &SqlitePool {
        &self.registry_pool
    }

    /// Get or create a shop database pool.
    ///
    /// Shop databases are lazy-loaded on first access. If the pool doesn't exist,
    /// it will be created based on the shop's database configuration.
    pub async fn get_shop_pool(&self, shop_id: &str) -> DbResult<Arc<SqlitePool>> {
        // Check if pool already exists
        if let Some(pool) = self.shop_pools.get(shop_id) {
            return Ok(Arc::clone(&pool));
        }

        // Create new pool for this shop
        let pool = self.create_shop_pool(shop_id, &DatabaseConfig::default()).await?;
        let pool = Arc::new(pool);
        self.shop_pools.insert(shop_id.to_string(), Arc::clone(&pool));

        Ok(pool)
    }

    /// Get or create a shop database pool with specific configuration.
    pub async fn get_shop_pool_with_config(
        &self,
        shop_id: &str,
        config: &DatabaseConfig,
    ) -> DbResult<Arc<SqlitePool>> {
        // Check if pool already exists
        if let Some(pool) = self.shop_pools.get(shop_id) {
            return Ok(Arc::clone(&pool));
        }

        // Create new pool based on config
        let pool = self.create_shop_pool(shop_id, config).await?;
        let pool = Arc::new(pool);
        self.shop_pools.insert(shop_id.to_string(), Arc::clone(&pool));

        Ok(pool)
    }

    /// Create a new shop database pool.
    async fn create_shop_pool(
        &self,
        shop_id: &str,
        config: &DatabaseConfig,
    ) -> DbResult<SqlitePool> {
        match config.database_type {
            DatabaseType::Sqlite => self.create_sqlite_shop_pool(shop_id, config).await,
            DatabaseType::Postgres => {
                // Postgres support will be added in the future
                Err(DatabaseError::invalid_config(
                    "Postgres support is not yet implemented",
                ))
            }
        }
    }

    /// Create a SQLite pool for a shop database.
    async fn create_sqlite_shop_pool(
        &self,
        shop_id: &str,
        config: &DatabaseConfig,
    ) -> DbResult<SqlitePool> {
        let db_path = self.get_shop_db_path(shop_id);

        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let db_url = format!(
            "sqlite:{}?mode=rwc",
            db_path.to_string_lossy().replace(' ', "%20")
        );

        let connect_options = SqliteConnectOptions::from_str(&db_url)
            .map_err(|e| DatabaseError::connection(e.to_string()))?
            .create_if_missing(true)
            .foreign_keys(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .acquire_timeout(Duration::from_secs(config.connect_timeout_secs))
            .idle_timeout(Duration::from_secs(config.idle_timeout_secs))
            .connect_with(connect_options)
            .await?;

        Ok(pool)
    }

    /// Get the file path for a shop's SQLite database.
    pub fn get_shop_db_path(&self, shop_id: &str) -> PathBuf {
        self.data_dir.join(format!("shop_{}.db", shop_id))
    }

    /// Check if a shop database file exists.
    pub fn shop_db_exists(&self, shop_id: &str) -> bool {
        self.get_shop_db_path(shop_id).exists()
    }

    /// Invalidate and close a shop's database pool.
    ///
    /// This should be called when a shop is deleted or its configuration changes.
    pub async fn invalidate_shop_pool(&self, shop_id: &str) {
        if let Some((_, pool)) = self.shop_pools.remove(shop_id) {
            pool.close().await;
        }
    }

    /// Delete a shop's database file.
    ///
    /// This should only be called after invalidating the pool and
    /// soft-deleting the shop from the registry.
    pub fn delete_shop_db(&self, shop_id: &str) -> DbResult<()> {
        let db_path = self.get_shop_db_path(shop_id);
        if db_path.exists() {
            std::fs::remove_file(&db_path)?;
        }
        Ok(())
    }

    /// Get the number of active shop pools.
    pub fn active_shop_pool_count(&self) -> usize {
        self.shop_pools.len()
    }

    /// Get the data directory path.
    pub fn data_dir(&self) -> &PathBuf {
        &self.data_dir
    }

    /// Close all pools and prepare for shutdown.
    pub async fn shutdown(&self) {
        // Close all shop pools
        for entry in self.shop_pools.iter() {
            entry.value().close().await;
        }
        self.shop_pools.clear();

        // Close registry pool
        self.registry_pool.close().await;
    }
}

impl std::fmt::Debug for PoolManager {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("PoolManager")
            .field("data_dir", &self.data_dir)
            .field("active_shop_pools", &self.shop_pools.len())
            .finish()
    }
}
