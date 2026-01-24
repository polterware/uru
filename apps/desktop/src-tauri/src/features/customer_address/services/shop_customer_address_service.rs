//! Shop-scoped Customer Address Service for Multi-Database Architecture

use crate::features::customer::models::customer_model::CustomerAddress;
use crate::features::customer_address::repositories::shop_customer_address_repository::ShopCustomerAddressRepository;
use sqlx::SqlitePool;
use std::sync::Arc;

pub struct ShopCustomerAddressService {
    pool: Arc<SqlitePool>,
    repo: ShopCustomerAddressRepository,
}

impl ShopCustomerAddressService {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        let repo = ShopCustomerAddressRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn create_address(&self, address: &CustomerAddress) -> Result<CustomerAddress, String> {
        self.repo
            .create(address)
            .await
            .map_err(|e| format!("Failed to create customer address: {}", e))
    }

    pub async fn create_many(&self, addresses: Vec<CustomerAddress>) -> Result<Vec<CustomerAddress>, String> {
        self.repo
            .create_many(addresses)
            .await
            .map_err(|e| format!("Failed to create customer addresses: {}", e))
    }

    pub async fn update_address(&self, address: &CustomerAddress) -> Result<CustomerAddress, String> {
        self.repo
            .update(address)
            .await
            .map_err(|e| format!("Failed to update customer address: {}", e))
    }

    pub async fn get_address(&self, id: &str) -> Result<Option<CustomerAddress>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get customer address: {}", e))
    }

    pub async fn list_addresses(&self) -> Result<Vec<CustomerAddress>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list customer addresses: {}", e))
    }

    pub async fn list_by_customer(&self, customer_id: &str) -> Result<Vec<CustomerAddress>, String> {
        self.repo
            .list_by_customer(customer_id)
            .await
            .map_err(|e| format!("Failed to list customer addresses: {}", e))
    }

    pub async fn delete_address(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete customer address: {}", e))
    }

    pub async fn delete_by_customer(&self, customer_id: &str) -> Result<(), String> {
        self.repo
            .delete_by_customer_id(customer_id)
            .await
            .map_err(|e| format!("Failed to delete customer addresses: {}", e))
    }
}
