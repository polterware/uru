use crate::db::RepositoryFactory;
use crate::features::payment::models::payment_model::Payment;
use crate::features::payment::services::shop_payment_service::ShopPaymentService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn list_payments(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Payment>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPaymentService::new(pool);
    service.list_payments().await
}

#[tauri::command]
pub async fn list_payments_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Payment>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPaymentService::new(pool);
    service.list_payments().await
}

#[tauri::command]
pub async fn get_payment(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Payment>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPaymentService::new(pool);
    service.get_payment(&id).await
}

#[tauri::command]
pub async fn update_payment_status(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
    status: String,
) -> Result<Payment, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPaymentService::new(pool);
    service.update_payment_status(&id, &status).await
}
