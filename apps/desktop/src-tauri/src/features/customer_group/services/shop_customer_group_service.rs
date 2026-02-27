//! Shop-scoped Customer Group Service for Multi-Database Architecture

use crate::features::customer_group::dtos::customer_group_dto::{
    CreateCustomerGroupDTO, UpdateCustomerGroupDTO,
};
use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use crate::features::customer_group::repositories::shop_customer_group_repository::ShopCustomerGroupRepository;
use sqlx::AnyPool;
use std::sync::Arc;

pub struct ShopCustomerGroupService {
    pool: Arc<AnyPool>,
    shop_id: String,
    repo: ShopCustomerGroupRepository,
}

impl ShopCustomerGroupService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopCustomerGroupRepository::new(pool.clone(), shop_id.clone());
        Self {
            pool,
            shop_id,
            repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub async fn create_group(&self, payload: CreateCustomerGroupDTO) -> Result<CustomerGroup, String> {
        let group = payload.into_model();
        self.repo
            .create(&group)
            .await
            .map_err(|e| format!("Failed to create customer group: {}", e))
    }

    pub async fn update_group(&self, payload: UpdateCustomerGroupDTO) -> Result<CustomerGroup, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch customer group: {}", e))?
            .ok_or_else(|| format!("Customer group not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update customer group: {}", e))
    }

    pub async fn delete_group(&self, id: &str) -> Result<(), String> {
        // First delete memberships
        sqlx::query("UPDATE customer_group_memberships SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE customer_group_id = $1")
            .bind(id)
            .execute(&*self.pool)
            .await
            .map_err(|e| format!("Failed to delete group memberships: {}", e))?;

        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete customer group: {}", e))
    }

    pub async fn get_group(&self, id: &str) -> Result<Option<CustomerGroup>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch customer group: {}", e))
    }

    pub async fn list_groups(&self) -> Result<Vec<CustomerGroup>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list customer groups: {}", e))
    }
}
