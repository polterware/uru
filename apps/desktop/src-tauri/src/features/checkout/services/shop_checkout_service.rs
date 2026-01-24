//! Shop-scoped Checkout Service for Multi-Database Architecture

use crate::features::checkout::dtos::checkout_dto::{CreateCheckoutDTO, UpdateCheckoutDTO};
use crate::features::checkout::models::checkout_model::Checkout;
use crate::features::checkout::repositories::shop_checkout_repository::ShopCheckoutRepository;
use sqlx::SqlitePool;
use std::sync::Arc;

pub struct ShopCheckoutService {
    pool: Arc<SqlitePool>,
    shop_id: String,
    repo: ShopCheckoutRepository,
}

impl ShopCheckoutService {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        let repo = ShopCheckoutRepository::new(pool.clone(), shop_id.clone());
        Self {
            pool,
            shop_id,
            repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn create_checkout(&self, payload: CreateCheckoutDTO) -> Result<Checkout, String> {
        let checkout = payload.into_model();
        self.repo
            .create(&checkout)
            .await
            .map_err(|e| format!("Failed to create checkout: {}", e))
    }

    pub async fn update_checkout(&self, payload: UpdateCheckoutDTO) -> Result<Checkout, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch checkout: {}", e))?
            .ok_or_else(|| format!("Checkout not found: {}", payload.id))?;

        let updated = payload.apply_to_checkout(existing);
        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update checkout: {}", e))
    }

    pub async fn delete_checkout(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete checkout: {}", e))
    }

    pub async fn get_checkout(&self, id: &str) -> Result<Option<Checkout>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch checkout: {}", e))
    }

    pub async fn get_checkout_by_token(&self, token: &str) -> Result<Option<Checkout>, String> {
        self.repo
            .get_by_token(token)
            .await
            .map_err(|e| format!("Failed to fetch checkout: {}", e))
    }

    pub async fn list_checkouts(&self) -> Result<Vec<Checkout>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list checkouts: {}", e))
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Checkout, String> {
        self.repo
            .update_status(id, status)
            .await
            .map_err(|e| format!("Failed to update checkout status: {}", e))
    }
}
