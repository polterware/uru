use crate::db::RepositoryFactory;
use crate::features::transaction::dtos::transaction_dto::{
    CompleteSaleDTO, CreateTransactionDTO, UpdateTransactionDTO, UpdateTransactionStatusDTO,
};
use crate::features::transaction::models::transaction_model::Transaction;
use crate::features::transaction::services::shop_transaction_service::ShopTransactionService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateTransactionDTO,
) -> Result<Transaction, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.create_transaction(payload).await
}

#[tauri::command]
pub async fn update_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateTransactionDTO,
) -> Result<Transaction, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.update_transaction(payload).await
}

#[tauri::command]
pub async fn delete_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.delete_transaction(&id).await
}

#[tauri::command]
pub async fn get_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Transaction>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.get_transaction(&id).await
}

#[tauri::command]
pub async fn list_transactions(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Transaction>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.list_transactions().await
}

#[tauri::command]
pub async fn list_transactions_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Transaction>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.list_transactions().await
}

#[tauri::command]
pub async fn update_transaction_status(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateTransactionStatusDTO,
) -> Result<Transaction, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.update_status(&payload.id, &payload.status).await
}

#[tauri::command]
pub async fn complete_sale_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: CompleteSaleDTO,
) -> Result<Transaction, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.complete_sale(&payload.id, &payload.location_id).await
}

#[tauri::command]
pub async fn cancel_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Transaction, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopTransactionService::new(pool, shop_id);
    service.cancel_transaction(&id).await
}
