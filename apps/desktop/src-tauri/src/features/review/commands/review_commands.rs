use crate::db::RepositoryFactory;
use crate::features::review::models::review_model::Review;
use crate::features::review::services::shop_review_service::ShopReviewService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn list_reviews_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Review>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopReviewService::new(pool);
    service.list_reviews().await
}

#[tauri::command]
pub async fn list_reviews(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Review>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopReviewService::new(pool);
    service.list_reviews().await
}

#[tauri::command]
pub async fn delete_review(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopReviewService::new(pool);
    service.delete_review(&id).await
}

#[tauri::command]
pub async fn get_review(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Review>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopReviewService::new(pool);
    service.get_review(&id).await
}

#[tauri::command]
pub async fn create_review(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: Review,
) -> Result<Review, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopReviewService::new(pool);
    service.create_review(&payload).await
}

#[tauri::command]
pub async fn update_review(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    _id: String,
    payload: Review,
) -> Result<Review, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopReviewService::new(pool);
    service.update_review(&payload).await
}
