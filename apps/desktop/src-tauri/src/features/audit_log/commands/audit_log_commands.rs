use crate::db::RepositoryFactory;
use crate::features::audit_log::models::audit_log_model::AuditLog;
use crate::features::audit_log::services::shop_audit_log_service::ShopAuditLogService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn get_audit_log(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<AuditLog>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopAuditLogService::new(pool);
    service.get_log(&id).await
}

#[tauri::command]
pub async fn list_audit_logs(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    _page: Option<u32>,
    _per_page: Option<u32>,
) -> Result<Vec<AuditLog>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopAuditLogService::new(pool);
    service.list_logs().await
}

#[tauri::command]
pub async fn list_audit_logs_by_table(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    table_name: String,
) -> Result<Vec<AuditLog>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopAuditLogService::new(pool);
    service.list_by_table(&table_name).await
}

#[tauri::command]
pub async fn list_audit_logs_by_record(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    table_name: String,
    record_id: String,
) -> Result<Vec<AuditLog>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopAuditLogService::new(pool);
    service.list_by_record(&table_name, &record_id).await
}

#[tauri::command]
pub async fn list_audit_logs_filtered(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    table_name: Option<String>,
    record_id: Option<String>,
    changed_by: Option<String>,
) -> Result<Vec<AuditLog>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopAuditLogService::new(pool);

    // Filter based on provided parameters
    if let Some(table) = table_name {
        if let Some(record) = record_id {
            return service.list_by_record(&table, &record).await;
        }
        return service.list_by_table(&table).await;
    }

    if let Some(user) = changed_by {
        return service.list_by_user(&user).await;
    }

    service.list_logs().await
}
