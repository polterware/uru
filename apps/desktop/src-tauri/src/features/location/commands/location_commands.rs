use crate::db::RepositoryFactory;
use crate::features::location::dtos::location_dto::{CreateLocationDTO, UpdateLocationDTO};
use crate::features::location::models::location_model::Location;
use crate::features::location::services::shop_location_service::ShopLocationService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_location(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateLocationDTO,
) -> Result<Location, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.create_location(payload).await
}

#[tauri::command]
pub async fn update_location(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateLocationDTO,
) -> Result<Location, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.update_location(payload).await
}

#[tauri::command]
pub async fn delete_location(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.delete_location(&id).await
}

#[tauri::command]
pub async fn get_location(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Location>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.get_location(&id).await
}

#[tauri::command]
pub async fn list_locations(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Location>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.list_locations().await
}

#[tauri::command]
pub async fn list_locations_by_type(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    location_type: String,
) -> Result<Vec<Location>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.list_locations_by_type(&location_type).await
}

#[tauri::command]
pub async fn list_sellable_locations(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Location>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopLocationService::new(pool, shop_id);
    service.list_sellable_locations().await
}
