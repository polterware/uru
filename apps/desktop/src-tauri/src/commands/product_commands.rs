use crate::dtos::product_dto::{CreateProductDTO, UpdateProductDTO};
use crate::models::product_model::Product;
use crate::services::product_service::ProductService;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_product(
    pool: State<'_, SqlitePool>,
    payload: CreateProductDTO,
) -> Result<Product, String> {
    let service = ProductService::new(pool.inner().clone());
    service.create_product(payload).await
}

#[tauri::command]
pub async fn update_product(
    pool: State<'_, SqlitePool>,
    payload: UpdateProductDTO,
) -> Result<Product, String> {
    let service = ProductService::new(pool.inner().clone());
    service.update_product(payload).await
}

#[tauri::command]
pub async fn delete_product(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = ProductService::new(pool.inner().clone());
    service.delete_product(&id).await
}

#[tauri::command]
pub async fn get_product(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Product>, String> {
    let service = ProductService::new(pool.inner().clone());
    service.get_product(&id).await
}

#[tauri::command]
pub async fn list_products(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Product>, String> {
    let service = ProductService::new(pool.inner().clone());
    service.list_products().await
}
