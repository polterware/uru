use crate::db::RepositoryFactory;
use crate::features::brand::dtos::brand_dto::{CreateBrandDTO, UpdateBrandDTO};
use crate::features::brand::models::brand_model::Brand;
use crate::features::brand::services::shop_brand_service::ShopBrandService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_brand(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateBrandDTO,
) -> Result<Brand, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopBrandService::new(pool, shop_id);
    service.create_brand(payload).await
}

#[tauri::command]
pub async fn update_brand(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateBrandDTO,
) -> Result<Brand, String> {
    let shop_id = payload
        .shop_id
        .clone()
        .ok_or_else(|| "shop_id is required for update".to_string())?;
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopBrandService::new(pool, shop_id);
    service.update_brand(payload).await
}

#[tauri::command]
pub async fn delete_brand(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopBrandService::new(pool, shop_id);
    service.delete_brand(&id).await
}

#[tauri::command]
pub async fn get_brand(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Brand>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopBrandService::new(pool, shop_id);
    service.get_brand(&id).await
}

#[tauri::command]
pub async fn list_brands(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Brand>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopBrandService::new(pool, shop_id);
    service.list_brands().await
}

#[tauri::command]
pub async fn list_brands_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Brand>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopBrandService::new(pool, shop_id);
    service.list_brands().await
}
