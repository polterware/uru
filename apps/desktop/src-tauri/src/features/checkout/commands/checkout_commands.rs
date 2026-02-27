use crate::db::RepositoryFactory;
use crate::features::checkout::dtos::checkout_dto::{CreateCheckoutDTO, UpdateCheckoutDTO};
use crate::features::checkout::models::checkout_model::Checkout;
use crate::features::checkout::services::shop_checkout_service::ShopCheckoutService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_checkout(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateCheckoutDTO,
) -> Result<Checkout, String> {
    let shop_id = payload
        .shop_id
        .clone()
        .ok_or_else(|| "shop_id is required".to_string())?;
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.create_checkout(payload).await
}

#[tauri::command]
pub async fn update_checkout(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateCheckoutDTO,
) -> Result<Checkout, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.update_checkout(payload).await
}

#[tauri::command]
pub async fn delete_checkout(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.delete_checkout(&id).await
}

#[tauri::command]
pub async fn get_checkout(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Checkout>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.get_checkout(&id).await
}

#[tauri::command]
pub async fn get_checkout_by_token(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    token: String,
) -> Result<Option<Checkout>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.get_checkout_by_token(&token).await
}

#[tauri::command]
pub async fn list_checkouts(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Checkout>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.list_checkouts().await
}

#[tauri::command]
pub async fn list_checkouts_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Checkout>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCheckoutService::new(pool, shop_id);
    service.list_checkouts().await
}
