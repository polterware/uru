use crate::db::RepositoryFactory;
use crate::features::inquiry::dtos::inquiry_dto::CreateInquiryDTO;
use crate::features::inquiry::models::inquiry_model::Inquiry;
use crate::features::inquiry::services::shop_inquiry_service::ShopInquiryService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_inquiry(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    payload: CreateInquiryDTO,
) -> Result<Inquiry, String> {
    let shop_id = payload.shop_id.clone();
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopInquiryService::new(pool, shop_id);
    service.create_inquiry(payload).await
}

#[tauri::command]
pub async fn delete_inquiry(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopInquiryService::new(pool, shop_id);
    service.delete_inquiry(&id).await
}

#[tauri::command]
pub async fn get_inquiry(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Inquiry>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopInquiryService::new(pool, shop_id);
    service.get_inquiry(&id).await
}

#[tauri::command]
pub async fn list_inquiries(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Inquiry>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopInquiryService::new(pool, shop_id);
    service.list_inquiries().await
}

#[tauri::command]
pub async fn list_inquiries_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Inquiry>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopInquiryService::new(pool, shop_id);
    service.list_inquiries().await
}
