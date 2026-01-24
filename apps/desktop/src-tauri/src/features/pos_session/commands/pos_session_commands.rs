use crate::db::RepositoryFactory;
use crate::features::pos_session::dtos::pos_session_dto::{
    ClosePosSessionDTO, CreatePosSessionDTO, UpdatePosSessionDTO,
};
use crate::features::pos_session::models::pos_session_model::PosSession;
use crate::features::pos_session::services::shop_pos_session_service::ShopPosSessionService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_pos_session(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreatePosSessionDTO,
) -> Result<PosSession, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.create_pos_session(payload).await
}

#[tauri::command]
pub async fn update_pos_session(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdatePosSessionDTO,
) -> Result<PosSession, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.update_pos_session(payload).await
}

#[tauri::command]
pub async fn close_pos_session(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: ClosePosSessionDTO,
) -> Result<PosSession, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.close_pos_session(payload).await
}

#[tauri::command]
pub async fn delete_pos_session(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.delete_pos_session(&id).await
}

#[tauri::command]
pub async fn get_pos_session(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<PosSession>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.get_pos_session(&id).await
}

#[tauri::command]
pub async fn list_pos_sessions(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<PosSession>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.list_pos_sessions().await
}

#[tauri::command]
pub async fn list_pos_sessions_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<PosSession>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.list_pos_sessions().await
}

#[tauri::command]
pub async fn get_open_pos_session_by_operator(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    operator_id: String,
) -> Result<Option<PosSession>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopPosSessionService::new(pool, shop_id);
    service.get_open_session_by_operator(&operator_id).await
}
