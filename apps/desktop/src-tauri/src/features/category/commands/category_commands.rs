use crate::db::RepositoryFactory;
use crate::features::category::dtos::category_dto::{CreateCategoryDTO, UpdateCategoryDTO};
use crate::features::category::models::category_model::Category;
use crate::features::category::services::shop_category_service::ShopCategoryService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_category(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateCategoryDTO,
) -> Result<Category, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCategoryService::new(pool, shop_id);
    service.create_category(payload).await
}

#[tauri::command]
pub async fn update_category(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateCategoryDTO,
) -> Result<Category, String> {
    let shop_id = payload
        .shop_id
        .clone()
        .ok_or_else(|| "shop_id is required for update".to_string())?;
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCategoryService::new(pool, shop_id);
    service.update_category(payload).await
}

#[tauri::command]
pub async fn delete_category(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCategoryService::new(pool, shop_id);
    service.delete_category(&id).await
}

#[tauri::command]
pub async fn get_category(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Category>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCategoryService::new(pool, shop_id);
    service.get_category(&id).await
}

#[tauri::command]
pub async fn list_categories_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Category>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCategoryService::new(pool, shop_id);
    service.list_categories().await
}

#[tauri::command]
pub async fn list_categories(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Category>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCategoryService::new(pool, shop_id);
    service.list_categories().await
}
