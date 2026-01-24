//! Shop-scoped Shipment Service for Multi-Database Architecture

use crate::features::shipment::models::shipment_model::Shipment;
use crate::features::shipment::repositories::shop_shipment_repository::ShopShipmentRepository;
use sqlx::SqlitePool;
use std::sync::Arc;

pub struct ShopShipmentService {
    pool: Arc<SqlitePool>,
    repo: ShopShipmentRepository,
}

impl ShopShipmentService {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        let repo = ShopShipmentRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn create_shipment(&self, shipment: &Shipment) -> Result<Shipment, String> {
        self.repo
            .create(shipment)
            .await
            .map_err(|e| format!("Failed to create shipment: {}", e))
    }

    pub async fn update_shipment(&self, shipment: &Shipment) -> Result<Shipment, String> {
        self.repo
            .update(shipment)
            .await
            .map_err(|e| format!("Failed to update shipment: {}", e))
    }

    pub async fn get_shipment(&self, id: &str) -> Result<Option<Shipment>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get shipment: {}", e))
    }

    pub async fn list_shipments(&self) -> Result<Vec<Shipment>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list shipments: {}", e))
    }

    pub async fn list_by_order(&self, order_id: &str) -> Result<Vec<Shipment>, String> {
        self.repo
            .list_by_order(order_id)
            .await
            .map_err(|e| format!("Failed to list shipments by order: {}", e))
    }

    pub async fn delete_shipment(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete shipment: {}", e))
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Shipment, String> {
        self.repo
            .update_status(id, status)
            .await
            .map_err(|e| format!("Failed to update shipment status: {}", e))
    }

    pub async fn mark_shipped(
        &self,
        id: &str,
        tracking_number: Option<&str>,
    ) -> Result<Shipment, String> {
        self.repo
            .mark_shipped(id, tracking_number)
            .await
            .map_err(|e| format!("Failed to mark shipment as shipped: {}", e))
    }

    pub async fn mark_delivered(&self, id: &str) -> Result<Shipment, String> {
        self.repo
            .mark_delivered(id)
            .await
            .map_err(|e| format!("Failed to mark shipment as delivered: {}", e))
    }
}
