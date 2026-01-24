//! Shop-scoped Location Service for Multi-Database Architecture

use crate::features::location::dtos::location_dto::{CreateLocationDTO, UpdateLocationDTO};
use crate::features::location::models::location_model::Location;
use crate::features::location::repositories::shop_location_repository::ShopLocationRepository;
use sqlx::SqlitePool;
use std::sync::Arc;

pub struct ShopLocationService {
    shop_id: String,
    repo: ShopLocationRepository,
}

impl ShopLocationService {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        let repo = ShopLocationRepository::new(pool, shop_id.clone());
        Self { shop_id, repo }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub async fn create_location(&self, payload: CreateLocationDTO) -> Result<Location, String> {
        let location = payload.into_model();
        self.repo
            .create(&location)
            .await
            .map_err(|e| format!("Failed to create location: {}", e))
    }

    pub async fn update_location(&self, payload: UpdateLocationDTO) -> Result<Location, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch location: {}", e))?
            .ok_or_else(|| format!("Location not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update location: {}", e))
    }

    pub async fn delete_location(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete location: {}", e))
    }

    pub async fn get_location(&self, id: &str) -> Result<Option<Location>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch location: {}", e))
    }

    pub async fn list_locations(&self) -> Result<Vec<Location>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list locations: {}", e))
    }

    pub async fn list_locations_by_type(&self, location_type: &str) -> Result<Vec<Location>, String> {
        self.repo
            .list_by_type(location_type)
            .await
            .map_err(|e| format!("Failed to list locations by type: {}", e))
    }

    pub async fn list_sellable_locations(&self) -> Result<Vec<Location>, String> {
        self.repo
            .list_sellable()
            .await
            .map_err(|e| format!("Failed to list sellable locations: {}", e))
    }
}
