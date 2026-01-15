use crate::dtos::product::{CreateProductDTO, UpdateProductDTO};
use crate::models::product::Product;
use crate::repositories::product::ProductRepository;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_product(
    pool: State<'_, SqlitePool>,
    payload: CreateProductDTO,
) -> Result<Product, String> {
    let (product, categories) = payload.into_models();
    let repo = ProductRepository::new(pool.inner().clone());

    repo.create(product, categories)
        .await
        .map_err(|e| format!("Erro ao criar produto: {}", e))
}

#[tauri::command]
pub async fn update_product(
    pool: State<'_, SqlitePool>,
    payload: UpdateProductDTO,
) -> Result<Product, String> {
    let (product, _) = payload.into_models();
    let repo = ProductRepository::new(pool.inner().clone());

    repo.update(product)
        .await
        .map_err(|e| format!("Erro ao atualizar produto: {}", e))
}

#[tauri::command]
pub async fn delete_product(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = ProductRepository::new(pool.inner().clone());

    repo.delete(&id)
        .await
        .map_err(|e| format!("Erro ao deletar produto: {}", e))
}

#[tauri::command]
pub async fn get_product(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Product>, String> {
    let repo = ProductRepository::new(pool.inner().clone());

    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Erro ao buscar produto: {}", e))
}

#[tauri::command]
pub async fn list_products(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Product>, String> {
    let repo = ProductRepository::new(pool.inner().clone());

    repo.list()
        .await
        .map_err(|e| format!("Erro ao listar produtos: {}", e))
}
