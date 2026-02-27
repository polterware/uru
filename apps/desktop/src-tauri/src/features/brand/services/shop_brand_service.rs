//! Shop-scoped Brand Service for Multi-Database Architecture
//!
//! This service operates on a shop-specific database where each shop
//! has its own isolated database file.

use crate::features::brand::dtos::brand_dto::{CreateBrandDTO, UpdateBrandDTO};
use crate::features::brand::models::brand_model::Brand;
use crate::features::brand::repositories::shop_brand_repository::ShopBrandRepository;
use sqlx::AnyPool;
use std::sync::Arc;

/// Brand service that operates on a shop-specific database.
pub struct ShopBrandService {
    shop_id: String,
    repo: ShopBrandRepository,
}

impl ShopBrandService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopBrandRepository::new(pool, shop_id.clone());
        Self { shop_id, repo }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub async fn create_brand(&self, payload: CreateBrandDTO) -> Result<Brand, String> {
        let brand = payload.into_model();
        self.repo
            .create(&brand)
            .await
            .map_err(|e| format!("Failed to create brand: {}", e))
    }

    pub async fn update_brand(&self, payload: UpdateBrandDTO) -> Result<Brand, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch brand: {}", e))?
            .ok_or_else(|| format!("Brand not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update brand: {}", e))
    }

    pub async fn delete_brand(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete brand: {}", e))
    }

    pub async fn get_brand(&self, id: &str) -> Result<Option<Brand>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch brand: {}", e))
    }

    pub async fn list_brands(&self) -> Result<Vec<Brand>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list brands: {}", e))
    }

    pub async fn get_brand_by_slug(&self, slug: &str) -> Result<Option<Brand>, String> {
        self.repo
            .find_by_slug(slug)
            .await
            .map_err(|e| format!("Failed to fetch brand by slug: {}", e))
    }

    pub async fn list_featured_brands(&self) -> Result<Vec<Brand>, String> {
        self.repo
            .list_featured()
            .await
            .map_err(|e| format!("Failed to list featured brands: {}", e))
    }
}
