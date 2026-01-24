//! Shop-scoped Audit Log Repository for Multi-Database Architecture

use crate::features::audit_log::models::audit_log_model::AuditLog;
use sqlx::{Result, SqlitePool};
use std::sync::Arc;

pub struct ShopAuditLogRepository {
    pool: Arc<SqlitePool>,
}

impl ShopAuditLogRepository {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, log: &AuditLog) -> Result<AuditLog> {
        let sql = r#"
            INSERT INTO audit_logs (
                id, table_name, record_id, action, old_data, new_data,
                changed_by, ip_address, user_agent, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        "#;

        sqlx::query_as::<_, AuditLog>(sql)
            .bind(&log.id)
            .bind(&log.table_name)
            .bind(&log.record_id)
            .bind(&log.action)
            .bind(&log.old_data)
            .bind(&log.new_data)
            .bind(&log.changed_by)
            .bind(&log.ip_address)
            .bind(&log.user_agent)
            .bind(&log.created_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<AuditLog>> {
        let sql = "SELECT * FROM audit_logs WHERE id = $1";
        sqlx::query_as::<_, AuditLog>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<AuditLog>> {
        let sql = "SELECT * FROM audit_logs ORDER BY created_at DESC";
        sqlx::query_as::<_, AuditLog>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_table(&self, table_name: &str) -> Result<Vec<AuditLog>> {
        let sql = "SELECT * FROM audit_logs WHERE table_name = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, AuditLog>(sql)
            .bind(table_name)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_record(&self, table_name: &str, record_id: &str) -> Result<Vec<AuditLog>> {
        let sql = "SELECT * FROM audit_logs WHERE table_name = $1 AND record_id = $2 ORDER BY created_at DESC";
        sqlx::query_as::<_, AuditLog>(sql)
            .bind(table_name)
            .bind(record_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_user(&self, changed_by: &str) -> Result<Vec<AuditLog>> {
        let sql = "SELECT * FROM audit_logs WHERE changed_by = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, AuditLog>(sql)
            .bind(changed_by)
            .fetch_all(&*self.pool)
            .await
    }
}
