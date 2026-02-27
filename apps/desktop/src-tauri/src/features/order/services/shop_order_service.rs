//! Shop-scoped Order Service for Multi-Database Architecture

use crate::features::order::dtos::order_dto::{CreateOrderDTO, UpdateOrderDTO};
use crate::features::order::models::order_model::Order;
use crate::features::order::repositories::shop_order_repository::ShopOrderRepository;
use sqlx::AnyPool;
use std::sync::Arc;

pub struct ShopOrderService {
    pool: Arc<AnyPool>,
    shop_id: String,
    repo: ShopOrderRepository,
}

impl ShopOrderService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopOrderRepository::new(pool.clone(), shop_id.clone());
        Self {
            pool,
            shop_id,
            repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub fn pool(&self) -> Arc<AnyPool> {
        self.pool.clone()
    }

    pub async fn create_order(&self, payload: CreateOrderDTO) -> Result<Order, String> {
        let order = payload.into_model();
        self.repo
            .create(&order)
            .await
            .map_err(|e| format!("Failed to create order: {}", e))
    }

    pub async fn update_order(&self, payload: UpdateOrderDTO) -> Result<Order, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch order: {}", e))?
            .ok_or_else(|| format!("Order not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .create(&updated)
            .await
            .map_err(|e| format!("Failed to update order: {}", e))
    }

    pub async fn delete_order(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete order: {}", e))
    }

    pub async fn get_order(&self, id: &str) -> Result<Option<Order>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch order: {}", e))
    }

    pub async fn list_orders(&self) -> Result<Vec<Order>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list orders: {}", e))
    }

    pub async fn update_payment_status(&self, id: &str, status: &str) -> Result<Order, String> {
        self.repo
            .update_payment_status(id, status)
            .await
            .map_err(|e| format!("Failed to update payment status: {}", e))
    }

    pub async fn update_fulfillment_status(&self, id: &str, status: &str) -> Result<Order, String> {
        self.repo
            .update_fulfillment_status(id, status)
            .await
            .map_err(|e| format!("Failed to update fulfillment status: {}", e))
    }

    pub async fn cancel_order(&self, id: &str) -> Result<Order, String> {
        self.repo
            .cancel(id)
            .await
            .map_err(|e| format!("Failed to cancel order: {}", e))
    }
}
