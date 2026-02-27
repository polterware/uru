use crate::db::RepositoryFactory;
use crate::features::order::dtos::order_dto::{
    CreateOrderDTO, UpdateFulfillmentStatusDTO, UpdateOrderDTO, UpdatePaymentStatusDTO,
};
use crate::features::order::models::order_model::Order;
use crate::features::order::services::shop_order_service::ShopOrderService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_order(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateOrderDTO,
) -> Result<Order, String> {
    let shop_id = payload
        .shop_id
        .clone()
        .ok_or_else(|| "shop_id is required".to_string())?;
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.create_order(payload).await
}

#[tauri::command]
pub async fn update_order(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: UpdateOrderDTO,
) -> Result<Order, String> {
    let shop_id = payload
        .shop_id
        .clone()
        .ok_or_else(|| "shop_id is required for update".to_string())?;
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.update_order(payload).await
}

#[tauri::command]
pub async fn delete_order(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.delete_order(&id).await
}

#[tauri::command]
pub async fn get_order(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Order>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.get_order(&id).await
}

#[tauri::command]
pub async fn list_orders(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Order>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.list_orders().await
}

#[tauri::command]
pub async fn list_orders_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Order>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.list_orders().await
}

#[tauri::command]
pub async fn update_order_payment_status(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdatePaymentStatusDTO,
) -> Result<Order, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service
        .update_payment_status(&payload.id, &payload.payment_status)
        .await
}

#[tauri::command]
pub async fn update_order_fulfillment_status(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateFulfillmentStatusDTO,
) -> Result<Order, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service
        .update_fulfillment_status(&payload.id, &payload.fulfillment_status)
        .await
}

#[tauri::command]
pub async fn cancel_order(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Order, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopOrderService::new(pool, shop_id);
    service.cancel_order(&id).await
}
