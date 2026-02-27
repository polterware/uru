//! Shop-scoped Audit Log Service for Multi-Database Architecture

use crate::features::audit_log::models::audit_log_model::AuditLog;
use crate::features::audit_log::repositories::shop_audit_log_repository::ShopAuditLogRepository;
use sqlx::AnyPool;
use std::sync::Arc;

pub struct ShopAuditLogService {
    pool: Arc<AnyPool>,
    repo: ShopAuditLogRepository,
}

impl ShopAuditLogService {
    pub fn new(pool: Arc<AnyPool>) -> Self {
        let repo = ShopAuditLogRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<AnyPool> {
        self.pool.clone()
    }

    pub async fn create_log(&self, log: &AuditLog) -> Result<AuditLog, String> {
        self.repo
            .create(log)
            .await
            .map_err(|e| format!("Failed to create audit log: {}", e))
    }

    pub async fn get_log(&self, id: &str) -> Result<Option<AuditLog>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get audit log: {}", e))
    }

    pub async fn list_logs(&self) -> Result<Vec<AuditLog>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list audit logs: {}", e))
    }

    pub async fn list_by_table(&self, table_name: &str) -> Result<Vec<AuditLog>, String> {
        self.repo
            .list_by_table(table_name)
            .await
            .map_err(|e| format!("Failed to list audit logs by table: {}", e))
    }

    pub async fn list_by_record(&self, table_name: &str, record_id: &str) -> Result<Vec<AuditLog>, String> {
        self.repo
            .list_by_record(table_name, record_id)
            .await
            .map_err(|e| format!("Failed to list audit logs by record: {}", e))
    }

    pub async fn list_by_user(&self, changed_by: &str) -> Result<Vec<AuditLog>, String> {
        self.repo
            .list_by_user(changed_by)
            .await
            .map_err(|e| format!("Failed to list audit logs by user: {}", e))
    }
}
