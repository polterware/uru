use crate::db::RepositoryFactory;
use crate::features::product::dtos::product_dto::{
    CreateProductDTO, ProductListFilterDTO, UpdateProductDTO,
};
use crate::features::product::models::product_model::Product;
use crate::features::product::services::shop_product_service::ShopProductService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_product(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateProductDTO,
) -> Result<Product, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopProductService::new(pool, shop_id);
    service.create_product(payload).await
}

#[tauri::command]
pub async fn update_product(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateProductDTO,
) -> Result<Product, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopProductService::new(pool, shop_id);
    service.update_product(payload).await
}

#[tauri::command]
pub async fn delete_product(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopProductService::new(pool, shop_id);
    service.delete_product(&id).await
}

#[tauri::command]
pub async fn get_product(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Product>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopProductService::new(pool, shop_id);
    service.get_product(&id).await
}

#[tauri::command]
pub async fn list_products(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Product>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopProductService::new(pool, shop_id);
    service.list_products().await
}

#[tauri::command]
pub async fn list_products_filtered(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    filters: ProductListFilterDTO,
) -> Result<Vec<Product>, String> {
    let shop_id = filters.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopProductService::new(pool, shop_id);
    service.list_products_filtered(filters).await
}
