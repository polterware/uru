//! Shop-scoped Category Service for Multi-Database Architecture
//!
//! This service operates on a shop-specific database where each shop
//! has its own isolated database file.

use crate::features::category::dtos::category_dto::{CreateCategoryDTO, UpdateCategoryDTO};
use crate::features::category::models::category_model::Category;
use crate::features::category::repositories::shop_category_repository::ShopCategoryRepository;
use sqlx::AnyPool;
use std::sync::Arc;

/// Category service that operates on a shop-specific database.
pub struct ShopCategoryService {
    shop_id: String,
    repo: ShopCategoryRepository,
}

impl ShopCategoryService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopCategoryRepository::new(pool, shop_id.clone());
        Self { shop_id, repo }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub async fn create_category(&self, payload: CreateCategoryDTO) -> Result<Category, String> {
        let category = payload.into_model();
        self.repo
            .create(&category)
            .await
            .map_err(|e| format!("Failed to create category: {}", e))
    }

    pub async fn update_category(&self, payload: UpdateCategoryDTO) -> Result<Category, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch category: {}", e))?
            .ok_or_else(|| format!("Category not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update category: {}", e))
    }

    pub async fn delete_category(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete category: {}", e))
    }

    pub async fn get_category(&self, id: &str) -> Result<Option<Category>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch category: {}", e))
    }

    pub async fn list_categories(&self) -> Result<Vec<Category>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list categories: {}", e))
    }

    pub async fn get_category_by_slug(&self, slug: &str) -> Result<Option<Category>, String> {
        self.repo
            .find_by_slug(slug)
            .await
            .map_err(|e| format!("Failed to fetch category by slug: {}", e))
    }

    pub async fn list_root_categories(&self) -> Result<Vec<Category>, String> {
        self.repo
            .list_by_parent(None)
            .await
            .map_err(|e| format!("Failed to list root categories: {}", e))
    }

    pub async fn list_child_categories(&self, parent_id: &str) -> Result<Vec<Category>, String> {
        self.repo
            .list_by_parent(Some(parent_id))
            .await
            .map_err(|e| format!("Failed to list child categories: {}", e))
    }

    pub async fn list_visible_categories(&self) -> Result<Vec<Category>, String> {
        self.repo
            .list_visible()
            .await
            .map_err(|e| format!("Failed to list visible categories: {}", e))
    }
}
