//! Migration service for multi-database architecture
//!
//! Handles schema migrations for:
//! - Registry database (shops, users, roles, modules)
//! - Shop databases (products, customers, orders, etc.)

use crate::db::error::{DatabaseError, DbResult};
use crate::db::pool_manager::PoolManager;
use crate::db::types::DatabaseType;
use sqlx::{AnyPool, Executor, SqlitePool};
use std::sync::Arc;

/// SQL for registry schema (shops, users, roles, modules, shop_templates)
pub const REGISTRY_SCHEMA: &str = include_str!("../../migrations/001_registry_schema.sql");

/// SQL for shop schema (products, customers, orders, etc.) - SQLite version
pub const SHOP_SCHEMA_SQLITE: &str = include_str!("../../migrations/002_shop_schema_sqlite.sql");

/// SQL for shop schema (products, customers, orders, etc.) - PostgreSQL version
pub const SHOP_SCHEMA_POSTGRES: &str = include_str!("../../migrations/002_shop_schema_postgres.sql");

/// Service for managing database migrations
pub struct MigrationService {
    pool_manager: Arc<PoolManager>,
}

impl MigrationService {
    /// Create a new migration service
    pub fn new(pool_manager: Arc<PoolManager>) -> Self {
        Self { pool_manager }
    }

    /// Migrate the registry database.
    ///
    /// This should be called once during application startup.
    pub async fn migrate_registry(&self) -> DbResult<()> {
        let pool = self.pool_manager.registry();
        self.run_migration_registry(pool, REGISTRY_SCHEMA, "registry")
            .await
    }

    /// Migrate a shop's database.
    ///
    /// This should be called when:
    /// - A new shop is created
    /// - The application detects a shop database needs migration
    pub async fn migrate_shop(&self, shop_id: &str) -> DbResult<()> {
        // Get shop database configuration
        let config = self.pool_manager.get_shop_database_config(shop_id).await?;

        // Get the AnyPool for this shop
        let pool = self.pool_manager.get_shop_pool(shop_id, &config).await?;

        // Select the correct migration SQL based on database type
        let sql = match config.database_type {
            DatabaseType::Sqlite => SHOP_SCHEMA_SQLITE,
            DatabaseType::Postgres => SHOP_SCHEMA_POSTGRES,
        };

        self.run_migration_any(&pool, sql, &format!("shop_{}", shop_id))
            .await
    }

    /// Run a migration script on the registry pool (always SQLite).
    async fn run_migration_registry(
        &self,
        pool: &SqlitePool,
        sql: &str,
        name: &str,
    ) -> DbResult<()> {
        // Check if migration tracking table exists
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS _migrations (
                id INTEGER PRIMARY KEY,
                version INTEGER NOT NULL DEFAULT 0,
                applied_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(r#"INSERT OR IGNORE INTO _migrations (id, version) VALUES (1, 0)"#)
            .execute(pool)
            .await?;

        // Check current migration version
        let row: (i32,) = sqlx::query_as("SELECT version FROM _migrations WHERE id = 1")
            .fetch_one(pool)
            .await
            .unwrap_or((0,));
        let current_version = row.0;
        let target_version = self.extract_version_from_sql(sql);

        if current_version >= target_version {
            println!(
                "[Migration] Database '{}' already at version {} (target: {})",
                name, current_version, target_version
            );
            return Ok(());
        }

        println!(
            "[Migration] Migrating database '{}' from version {} to {}",
            name, current_version, target_version
        );

        let statements = self.split_sql_statements(sql);
        println!(
            "[Migration] Total statements for '{}': {}",
            name,
            statements.len()
        );
        for (idx, statement) in statements.iter().enumerate() {
            let trimmed = Self::strip_leading_comments(statement.trim());
            if !trimmed.is_empty() {
                let preview = if trimmed.len() > 80 {
                    format!(
                        "{}...",
                        &trimmed[..trimmed
                            .char_indices()
                            .nth(80)
                            .map(|(i, _)| i)
                            .unwrap_or(trimmed.len())]
                    )
                } else {
                    trimmed.to_string()
                };
                println!(
                    "[Migration] Executing statement {} ({} chars): {}",
                    idx + 1,
                    trimmed.len(),
                    preview
                );

                sqlx::query(trimmed).execute(pool).await.map_err(|e| {
                    eprintln!("[Migration] FAILED at statement {}!", idx + 1);
                    eprintln!("[Migration] Statement content:\n{}", trimmed);
                    eprintln!("[Migration] Error: {}", e);
                    DatabaseError::migration(format!(
                        "Failed to execute migration for '{}': {}",
                        name, e
                    ))
                })?;
            }
        }

        // Update migration version
        sqlx::query(
            "UPDATE _migrations SET version = ?, applied_at = datetime('now') WHERE id = 1",
        )
        .bind(target_version)
        .execute(pool)
        .await?;

        println!(
            "[Migration] Successfully migrated database '{}' to version {}",
            name, target_version
        );
        Ok(())
    }

    /// Run a migration script on an AnyPool (shop databases — SQLite or Postgres).
    async fn run_migration_any(
        &self,
        pool: &AnyPool,
        sql: &str,
        name: &str,
    ) -> DbResult<()> {
        // Ensure migration tracking table exists
        // Use CURRENT_TIMESTAMP which works on both SQLite and Postgres
        pool.execute(
            sqlx::query(
                r#"
                CREATE TABLE IF NOT EXISTS _migrations (
                    id INTEGER PRIMARY KEY,
                    version INTEGER NOT NULL DEFAULT 0,
                    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                "#,
            ),
        )
        .await?;

        // Ensure at least one row exists — use ON CONFLICT for cross-DB compat
        pool.execute(
            sqlx::query(
                r#"INSERT INTO _migrations (id, version) VALUES (1, 0) ON CONFLICT (id) DO NOTHING"#,
            ),
        )
        .await?;

        // Check current migration version
        let row: (i32,) = sqlx::query_as("SELECT version FROM _migrations WHERE id = 1")
            .fetch_one(pool)
            .await
            .unwrap_or((0,));
        let current_version = row.0;
        let target_version = self.extract_version_from_sql(sql);

        if current_version >= target_version {
            println!(
                "[Migration] Database '{}' already at version {} (target: {})",
                name, current_version, target_version
            );
            return Ok(());
        }

        println!(
            "[Migration] Migrating database '{}' from version {} to {}",
            name, current_version, target_version
        );

        // Split SQL into statements and execute
        let statements = self.split_sql_statements(sql);
        println!(
            "[Migration] Total statements for '{}': {}",
            name,
            statements.len()
        );
        for (idx, statement) in statements.iter().enumerate() {
            let trimmed = Self::strip_leading_comments(statement.trim());
            if !trimmed.is_empty() {
                let preview = if trimmed.len() > 80 {
                    format!(
                        "{}...",
                        &trimmed[..trimmed
                            .char_indices()
                            .nth(80)
                            .map(|(i, _)| i)
                            .unwrap_or(trimmed.len())]
                    )
                } else {
                    trimmed.to_string()
                };
                println!(
                    "[Migration] Executing statement {} ({} chars): {}",
                    idx + 1,
                    trimmed.len(),
                    preview
                );

                pool.execute(sqlx::query(trimmed)).await.map_err(|e| {
                    eprintln!("[Migration] FAILED at statement {}!", idx + 1);
                    eprintln!("[Migration] Statement content:\n{}", trimmed);
                    eprintln!("[Migration] Error: {}", e);
                    DatabaseError::migration(format!(
                        "Failed to execute migration for '{}': {}",
                        name, e
                    ))
                })?;
            }
        }

        // Update migration version
        pool.execute(
            sqlx::query(
                "UPDATE _migrations SET version = $1, applied_at = CURRENT_TIMESTAMP WHERE id = 1",
            )
            .bind(target_version),
        )
        .await?;

        println!(
            "[Migration] Successfully migrated database '{}' to version {}",
            name, target_version
        );
        Ok(())
    }

    /// Extract version number from SQL (looks for -- Version: N comment).
    fn extract_version_from_sql(&self, sql: &str) -> i32 {
        for line in sql.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("-- Version:") {
                if let Some(version_str) = trimmed.strip_prefix("-- Version:") {
                    if let Ok(version) = version_str.trim().parse::<i32>() {
                        return version;
                    }
                }
            }
        }
        1 // Default to version 1
    }

    /// Strip leading comment lines from a SQL statement.
    /// This allows statements that start with section headers to be executed properly.
    fn strip_leading_comments(sql: &str) -> &str {
        let mut start = 0;
        for line in sql.lines() {
            let trimmed_line = line.trim();
            if trimmed_line.is_empty() || trimmed_line.starts_with("--") {
                // Skip empty lines and comment lines
                start += line.len();
                // Account for newline character
                if start < sql.len() {
                    start += 1;
                }
            } else {
                // Found actual SQL, return from here
                break;
            }
        }
        if start >= sql.len() {
            ""
        } else {
            &sql[start..]
        }
    }

    /// Split SQL into individual statements.
    fn split_sql_statements<'a>(&self, sql: &'a str) -> Vec<&'a str> {
        // Simple split by semicolon, but respect string literals
        // Uses byte indices for correct UTF-8 handling
        let mut statements = Vec::new();
        let mut start_byte = 0;
        let mut in_string = false;

        let bytes = sql.as_bytes();
        let mut i = 0;

        while i < bytes.len() {
            let b = bytes[i];

            if !in_string {
                if b == b'\'' {
                    // Entering a string
                    in_string = true;
                } else if b == b';' {
                    // End of statement
                    let stmt = &sql[start_byte..i];
                    if !stmt.trim().is_empty() {
                        statements.push(stmt);
                    }
                    start_byte = i + 1;
                }
            } else {
                // We're in a string
                if b == b'\'' {
                    // Check if this is an escaped quote ('')
                    if i + 1 < bytes.len() && bytes[i + 1] == b'\'' {
                        // Escaped quote - skip both quotes
                        i += 1;
                    } else {
                        // End of string
                        in_string = false;
                    }
                }
            }

            i += 1;
        }

        // Don't forget the last statement
        let last = &sql[start_byte..];
        if !last.trim().is_empty() && !last.trim().starts_with("--") {
            statements.push(last);
        }

        statements
    }
}

impl std::fmt::Debug for MigrationService {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("MigrationService").finish()
    }
}
