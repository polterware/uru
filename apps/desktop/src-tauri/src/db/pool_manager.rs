//! Pool manager for multi-database architecture
//!
//! Manages the registry database pool (always SQLite) and
//! lazy-loaded shop database pools (SQLite or Postgres via AnyPool).

use crate::db::error::{DatabaseError, DbResult};
use crate::db::types::{DatabaseConfig, DatabaseType};
use crate::features::shop::models::shop_model::Shop;
use dashmap::DashMap;
use sqlx::any::AnyPoolOptions;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{AnyPool, SqlitePool};
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

/// Manages database connection pools for the multi-database architecture.
///
/// The PoolManager handles:
/// - A single registry database (always SQLite) for shops, users, roles, modules
/// - Per-shop databases that are lazy-loaded on first access (SQLite or Postgres via AnyPool)
pub struct PoolManager {
    /// Registry database pool (always SQLite)
    registry_pool: SqlitePool,
    /// Shop database pools (AnyPool), keyed by shop_id
    shop_pools: DashMap<String, Arc<AnyPool>>,
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

    /// Get or create a shop database pool (AnyPool).
    ///
    /// Shop databases are lazy-loaded on first access. The AnyPool dispatches
    /// to SQLite or Postgres at runtime based on the connection URL.
    pub async fn get_shop_pool(
        &self,
        shop_id: &str,
        config: &DatabaseConfig,
    ) -> DbResult<Arc<AnyPool>> {
        // Check if pool already exists
        if let Some(pool) = self.shop_pools.get(shop_id) {
            return Ok(Arc::clone(&pool));
        }

        // Create new AnyPool for this shop
        let pool = self.create_shop_pool(shop_id, config).await?;
        let pool = Arc::new(pool);
        self.shop_pools
            .insert(shop_id.to_string(), Arc::clone(&pool));

        Ok(pool)
    }

    /// Get shop database configuration from registry.
    pub async fn get_shop_database_config(&self, shop_id: &str) -> DbResult<DatabaseConfig> {
        let shop: Option<Shop> = sqlx::query_as::<_, Shop>(
            "SELECT * FROM shops WHERE id = ? AND _status != 'deleted'",
        )
        .bind(shop_id)
        .fetch_optional(&self.registry_pool)
        .await?;

        let shop =
            shop.ok_or_else(|| DatabaseError::not_found(format!("Shop {} not found", shop_id)))?;

        // Parse database_config JSON if present
        if let Some(config_json) = shop.database_config {
            DatabaseConfig::from_json(&config_json).map_err(|e| {
                DatabaseError::invalid_config(format!("Invalid database_config: {}", e))
            })
        } else {
            // Default to SQLite if no config
            Ok(DatabaseConfig::default())
        }
    }

    /// Create an AnyPool for a shop database.
    ///
    /// Builds the connection URL based on the DatabaseConfig:
    /// - SQLite: `sqlite:path/to/shop_xxx.db?mode=rwc`
    /// - Postgres: uses the connection_string directly
    async fn create_shop_pool(
        &self,
        shop_id: &str,
        config: &DatabaseConfig,
    ) -> DbResult<AnyPool> {
        let connection_url = match config.database_type {
            DatabaseType::Sqlite => {
                let db_path = if let Some(ref path) = config.connection_string {
                    PathBuf::from(path)
                } else {
                    self.get_shop_db_path(shop_id)
                };

                // Ensure parent directory exists
                if let Some(parent) = db_path.parent() {
                    std::fs::create_dir_all(parent)?;
                }

                format!(
                    "sqlite:{}?mode=rwc",
                    db_path.to_string_lossy().replace(' ', "%20")
                )
            }
            DatabaseType::Postgres => config
                .connection_string
                .as_ref()
                .ok_or_else(|| {
                    DatabaseError::invalid_config("Postgres requires a connection_string")
                })?
                .clone(),
        };

        let pool = AnyPoolOptions::new()
            .max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .acquire_timeout(Duration::from_secs(config.connect_timeout_secs))
            .idle_timeout(Duration::from_secs(config.idle_timeout_secs))
            .connect(&connection_url)
            .await
            .map_err(|e| {
                DatabaseError::connection(format!(
                    "Failed to connect to {} database for shop {}: {}",
                    config.database_type, shop_id, e
                ))
            })?;

        // Test the connection
        sqlx::query("SELECT 1")
            .execute(&pool)
            .await
            .map_err(|e| {
                DatabaseError::connection(format!(
                    "Connection test failed for shop {}: {}",
                    shop_id, e
                ))
            })?;

        Ok(pool)
    }

    /// Get the file path for a shop's SQLite database.
    pub fn get_shop_db_path(&self, shop_id: &str) -> PathBuf {
        self.data_dir
            .join("shops")
            .join(format!("shop_{}.db", shop_id))
    }

    /// Check if a shop database file exists (SQLite only).
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
