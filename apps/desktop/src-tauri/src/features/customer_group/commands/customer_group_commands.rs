use crate::db::RepositoryFactory;
use crate::features::customer_group::dtos::customer_group_dto::{
    CreateCustomerGroupDTO, UpdateCustomerGroupDTO,
};
use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use crate::features::customer_group::services::shop_customer_group_service::ShopCustomerGroupService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_customer_group(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateCustomerGroupDTO,
) -> Result<CustomerGroup, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupService::new(pool, shop_id);
    service.create_group(payload).await
}

#[tauri::command]
pub async fn update_customer_group(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateCustomerGroupDTO,
) -> Result<CustomerGroup, String> {
    let shop_id = payload
        .shop_id
        .clone()
        .ok_or_else(|| "shop_id is required for update".to_string())?;
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupService::new(pool, shop_id);
    service.update_group(payload).await
}

#[tauri::command]
pub async fn delete_customer_group(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupService::new(pool, shop_id);
    service.delete_group(&id).await
}

#[tauri::command]
pub async fn get_customer_group(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<CustomerGroup>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupService::new(pool, shop_id);
    service.get_group(&id).await
}

#[tauri::command]
pub async fn list_customer_groups(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<CustomerGroup>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupService::new(pool, shop_id);
    service.list_groups().await
}

#[tauri::command]
pub async fn list_customer_groups_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<CustomerGroup>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupService::new(pool, shop_id);
    service.list_groups().await
}
