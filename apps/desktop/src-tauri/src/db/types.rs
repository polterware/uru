//! Database types and configuration

use serde::{Deserialize, Serialize};

/// Supported database types for shop databases
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum DatabaseType {
    /// Local SQLite database file (default for offline-first)
    #[default]
    Sqlite,
    /// PostgreSQL database (future: for cloud sync via Supabase)
    Postgres,
}

impl DatabaseType {
    /// Parse from string representation
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "postgres" | "postgresql" => Self::Postgres,
            _ => Self::Sqlite,
        }
    }

    /// Convert to string representation
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Sqlite => "sqlite",
            Self::Postgres => "postgres",
        }
    }
}

impl std::fmt::Display for DatabaseType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Configuration for a shop's database connection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    /// Type of database
    pub database_type: DatabaseType,
    /// Connection string (for Postgres) or file path (for SQLite)
    /// For SQLite, this is optional - will use default path if not set
    pub connection_string: Option<String>,
    /// Maximum number of connections in the pool
    #[serde(default = "default_max_connections")]
    pub max_connections: u32,
    /// Minimum number of connections to keep alive
    #[serde(default = "default_min_connections")]
    pub min_connections: u32,
    /// Connection timeout in seconds
    #[serde(default = "default_connect_timeout")]
    pub connect_timeout_secs: u64,
    /// Idle connection timeout in seconds
    #[serde(default = "default_idle_timeout")]
    pub idle_timeout_secs: u64,
}

fn default_max_connections() -> u32 {
    5
}

fn default_min_connections() -> u32 {
    1
}

fn default_connect_timeout() -> u64 {
    30
}

fn default_idle_timeout() -> u64 {
    600
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            database_type: DatabaseType::Sqlite,
            connection_string: None,
            max_connections: default_max_connections(),
            min_connections: default_min_connections(),
            connect_timeout_secs: default_connect_timeout(),
            idle_timeout_secs: default_idle_timeout(),
        }
    }
}

impl DatabaseConfig {
    /// Create a new SQLite configuration
    pub fn sqlite() -> Self {
        Self::default()
    }

    /// Create a new SQLite configuration with a specific path
    pub fn sqlite_with_path(path: String) -> Self {
        Self {
            database_type: DatabaseType::Sqlite,
            connection_string: Some(path),
            ..Default::default()
        }
    }

    /// Create a new Postgres configuration
    pub fn postgres(connection_string: String) -> Self {
        Self {
            database_type: DatabaseType::Postgres,
            connection_string: Some(connection_string),
            ..Default::default()
        }
    }

    /// Serialize to JSON string for storage
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Deserialize from JSON string
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

/// Represents a shop's database information
#[derive(Debug, Clone)]
pub struct ShopDatabase {
    /// Shop ID (UUID)
    pub shop_id: String,
    /// Database type
    pub database_type: DatabaseType,
    /// Full configuration
    pub config: DatabaseConfig,
}
