use crate::db::RepositoryFactory;
use crate::features::customer::dtos::customer_dto::{CreateCustomerDTO, UpdateCustomerDTO};
use crate::features::customer::models::customer_model::Customer;
use crate::features::customer::services::shop_customer_service::ShopCustomerService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_customer(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateCustomerDTO,
) -> Result<Customer, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerService::new(pool, shop_id);
    service.create_customer(payload).await
}

#[tauri::command]
pub async fn update_customer(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateCustomerDTO,
) -> Result<Customer, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerService::new(pool, shop_id);
    service.update_customer(payload).await
}

#[tauri::command]
pub async fn delete_customer(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerService::new(pool, shop_id);
    service.delete_customer(&id).await
}

#[tauri::command]
pub async fn get_customer(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Customer>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerService::new(pool, shop_id);
    service.get_customer(&id).await
}

#[tauri::command]
pub async fn list_customers(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Customer>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerService::new(pool, shop_id);
    service.list_customers().await
}

#[tauri::command]
pub async fn list_customers_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Customer>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerService::new(pool, shop_id);
    service.list_customers().await
}
