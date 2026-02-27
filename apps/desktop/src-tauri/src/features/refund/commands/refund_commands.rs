use crate::db::RepositoryFactory;
use crate::features::refund::models::refund_model::Refund;
use crate::features::refund::services::shop_refund_service::ShopRefundService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_refund(
    _repo_factory: State<'_, Arc<RepositoryFactory>>,
    _shop_id: String,
    _payment_id: String,
    _amount: f64,
    _reason: Option<String>,
) -> Result<Refund, String> {
    // Refunds are created through the payment service process_refund method
    Err("Use process_refund command through payment service".to_string())
}

#[tauri::command]
pub async fn update_refund(
    _repo_factory: State<'_, Arc<RepositoryFactory>>,
    _shop_id: String,
    _id: String,
) -> Result<Refund, String> {
    // Refunds are immutable after creation
    Err("Refunds cannot be updated after creation".to_string())
}

#[tauri::command]
pub async fn delete_refund(
    _repo_factory: State<'_, Arc<RepositoryFactory>>,
    _shop_id: String,
    _id: String,
) -> Result<(), String> {
    // Refunds should not be deleted
    Err("Refunds cannot be deleted".to_string())
}

#[tauri::command]
pub async fn get_refund(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Refund>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopRefundService::new(pool);
    service.get_refund(&id).await
}

#[tauri::command]
pub async fn list_refunds(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Refund>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopRefundService::new(pool);
    service.list_refunds().await
}

#[tauri::command]
pub async fn list_refunds_by_payment(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payment_id: String,
) -> Result<Vec<Refund>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopRefundService::new(pool);
    service.list_by_payment(&payment_id).await
}

#[tauri::command]
pub async fn update_refund_status(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
    status: String,
) -> Result<Refund, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopRefundService::new(pool);
    service.update_status(&id, &status).await
}
