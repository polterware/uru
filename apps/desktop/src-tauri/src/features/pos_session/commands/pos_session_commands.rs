use crate::features::pos_session::dtos::pos_session_dto::{
    ClosePosSessionDTO, CreatePosSessionDTO, UpdatePosSessionDTO,
};
use crate::features::pos_session::models::pos_session_model::PosSession;
use crate::features::pos_session::services::pos_session_service::PosSessionService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_pos_session(
    pool: State<'_, SqlitePool>,
    payload: CreatePosSessionDTO,
) -> Result<PosSession, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.create_pos_session(payload).await
}

#[tauri::command]
pub async fn update_pos_session(
    pool: State<'_, SqlitePool>,
    payload: UpdatePosSessionDTO,
) -> Result<PosSession, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.update_pos_session(payload).await
}

#[tauri::command]
pub async fn close_pos_session(
    pool: State<'_, SqlitePool>,
    payload: ClosePosSessionDTO,
) -> Result<PosSession, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.close_pos_session(payload).await
}

#[tauri::command]
pub async fn delete_pos_session(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.delete_pos_session(&id).await
}

#[tauri::command]
pub async fn get_pos_session(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<PosSession>, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.get_pos_session(&id).await
}

#[tauri::command]
pub async fn list_pos_sessions(pool: State<'_, SqlitePool>) -> Result<Vec<PosSession>, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.list_pos_sessions().await
}

#[tauri::command]
pub async fn list_pos_sessions_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<PosSession>, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.list_pos_sessions_by_shop(&shop_id).await
}

#[tauri::command]
pub async fn get_open_pos_session_by_operator(
    pool: State<'_, SqlitePool>,
    operator_id: String,
) -> Result<Option<PosSession>, String> {
    let service = PosSessionService::new(pool.inner().clone());
    service.get_open_session_by_operator(&operator_id).await
}
