//! Shop-scoped Review Service for Multi-Database Architecture

use crate::features::review::models::review_model::Review;
use crate::features::review::repositories::shop_review_repository::ShopReviewRepository;
use sqlx::AnyPool;
use std::sync::Arc;

pub struct ShopReviewService {
    pool: Arc<AnyPool>,
    repo: ShopReviewRepository,
}

impl ShopReviewService {
    pub fn new(pool: Arc<AnyPool>) -> Self {
        let repo = ShopReviewRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<AnyPool> {
        self.pool.clone()
    }

    pub async fn create_review(&self, review: &Review) -> Result<Review, String> {
        self.repo
            .create(review)
            .await
            .map_err(|e| format!("Failed to create review: {}", e))
    }

    pub async fn update_review(&self, review: &Review) -> Result<Review, String> {
        self.repo
            .update(review)
            .await
            .map_err(|e| format!("Failed to update review: {}", e))
    }

    pub async fn get_review(&self, id: &str) -> Result<Option<Review>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get review: {}", e))
    }

    pub async fn list_reviews(&self) -> Result<Vec<Review>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list reviews: {}", e))
    }

    pub async fn list_by_product(&self, product_id: &str) -> Result<Vec<Review>, String> {
        self.repo
            .list_by_product(product_id)
            .await
            .map_err(|e| format!("Failed to list reviews by product: {}", e))
    }

    pub async fn list_by_customer(&self, customer_id: &str) -> Result<Vec<Review>, String> {
        self.repo
            .list_by_customer(customer_id)
            .await
            .map_err(|e| format!("Failed to list reviews by customer: {}", e))
    }

    pub async fn list_by_order(&self, order_id: &str) -> Result<Vec<Review>, String> {
        self.repo
            .list_by_order(order_id)
            .await
            .map_err(|e| format!("Failed to list reviews by order: {}", e))
    }

    pub async fn delete_review(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete review: {}", e))
    }
}
