//! Shop-scoped Inventory Service for Multi-Database Architecture

use crate::features::inventory::models::inventory_level_model::InventoryLevel;
use crate::features::inventory::repositories::shop_inventory_repository::ShopInventoryRepository;
use crate::features::transaction::models::transaction_model::InventoryMovement;
use sqlx::AnyPool;
use std::sync::Arc;

pub struct ShopInventoryService {
    pool: Arc<AnyPool>,
    repo: ShopInventoryRepository,
}

impl ShopInventoryService {
    pub fn new(pool: Arc<AnyPool>) -> Self {
        let repo = ShopInventoryRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<AnyPool> {
        self.pool.clone()
    }

    // ============================================================
    // Inventory Level methods
    // ============================================================

    pub async fn create_level(&self, level: &InventoryLevel) -> Result<InventoryLevel, String> {
        self.repo
            .create_level(level)
            .await
            .map_err(|e| format!("Failed to create inventory level: {}", e))
    }

    pub async fn update_level(&self, level: &InventoryLevel) -> Result<InventoryLevel, String> {
        self.repo
            .update_level(level)
            .await
            .map_err(|e| format!("Failed to update inventory level: {}", e))
    }

    pub async fn get_level(&self, id: &str) -> Result<Option<InventoryLevel>, String> {
        self.repo
            .get_level_by_id(id)
            .await
            .map_err(|e| format!("Failed to get inventory level: {}", e))
    }

    pub async fn list_levels(&self) -> Result<Vec<InventoryLevel>, String> {
        self.repo
            .list_levels()
            .await
            .map_err(|e| format!("Failed to list inventory levels: {}", e))
    }

    pub async fn list_levels_by_product(
        &self,
        product_id: &str,
    ) -> Result<Vec<InventoryLevel>, String> {
        self.repo
            .list_levels_by_product(product_id)
            .await
            .map_err(|e| format!("Failed to list inventory levels by product: {}", e))
    }

    pub async fn list_levels_by_location(
        &self,
        location_id: &str,
    ) -> Result<Vec<InventoryLevel>, String> {
        self.repo
            .list_levels_by_location(location_id)
            .await
            .map_err(|e| format!("Failed to list inventory levels by location: {}", e))
    }

    pub async fn find_level_by_product_and_location(
        &self,
        product_id: &str,
        location_id: &str,
    ) -> Result<Option<InventoryLevel>, String> {
        self.repo
            .find_level_by_product_and_location(product_id, location_id)
            .await
            .map_err(|e| format!("Failed to find inventory level: {}", e))
    }

    pub async fn delete_level(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete_level(id)
            .await
            .map_err(|e| format!("Failed to delete inventory level: {}", e))
    }

    pub async fn adjust_quantity(
        &self,
        id: &str,
        quantity_change: f64,
    ) -> Result<InventoryLevel, String> {
        self.repo
            .adjust_quantity(id, quantity_change)
            .await
            .map_err(|e| format!("Failed to adjust inventory quantity: {}", e))
    }

    pub async fn reserve_quantity(
        &self,
        id: &str,
        quantity: f64,
    ) -> Result<InventoryLevel, String> {
        self.repo
            .reserve_quantity(id, quantity)
            .await
            .map_err(|e| format!("Failed to reserve inventory: {}", e))
    }

    pub async fn release_reservation(
        &self,
        id: &str,
        quantity: f64,
    ) -> Result<InventoryLevel, String> {
        self.repo
            .release_reservation(id, quantity)
            .await
            .map_err(|e| format!("Failed to release inventory reservation: {}", e))
    }

    // ============================================================
    // Inventory Movement methods
    // ============================================================

    pub async fn create_movement(
        &self,
        movement: &InventoryMovement,
    ) -> Result<InventoryMovement, String> {
        self.repo
            .create_movement(movement)
            .await
            .map_err(|e| format!("Failed to create inventory movement: {}", e))
    }

    pub async fn create_movements(
        &self,
        movements: Vec<InventoryMovement>,
    ) -> Result<Vec<InventoryMovement>, String> {
        self.repo
            .create_movements(movements)
            .await
            .map_err(|e| format!("Failed to create inventory movements: {}", e))
    }

    pub async fn list_movements(&self) -> Result<Vec<InventoryMovement>, String> {
        self.repo
            .list_movements()
            .await
            .map_err(|e| format!("Failed to list inventory movements: {}", e))
    }

    pub async fn list_movements_by_transaction(
        &self,
        transaction_id: &str,
    ) -> Result<Vec<InventoryMovement>, String> {
        self.repo
            .list_movements_by_transaction(transaction_id)
            .await
            .map_err(|e| format!("Failed to list inventory movements by transaction: {}", e))
    }

    pub async fn list_movements_by_inventory_level(
        &self,
        inventory_level_id: &str,
    ) -> Result<Vec<InventoryMovement>, String> {
        self.repo
            .list_movements_by_inventory_level(inventory_level_id)
            .await
            .map_err(|e| format!("Failed to list inventory movements by inventory level: {}", e))
    }

    pub async fn delete_movements_by_transaction(&self, transaction_id: &str) -> Result<(), String> {
        self.repo
            .delete_movements_by_transaction(transaction_id)
            .await
            .map_err(|e| format!("Failed to delete inventory movements: {}", e))
    }
}
