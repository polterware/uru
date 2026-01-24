//! Shop-scoped Customer Group Membership Service for Multi-Database Architecture

use crate::features::customer::models::customer_model::CustomerGroupMembership;
use crate::features::customer_group_membership::repositories::shop_customer_group_membership_repository::ShopCustomerGroupMembershipRepository;
use sqlx::SqlitePool;
use std::sync::Arc;

pub struct ShopCustomerGroupMembershipService {
    pool: Arc<SqlitePool>,
    repo: ShopCustomerGroupMembershipRepository,
}

impl ShopCustomerGroupMembershipService {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        let repo = ShopCustomerGroupMembershipRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn create_membership(&self, membership: &CustomerGroupMembership) -> Result<CustomerGroupMembership, String> {
        self.repo
            .create(membership)
            .await
            .map_err(|e| format!("Failed to create membership: {}", e))
    }

    pub async fn create_many(&self, memberships: Vec<CustomerGroupMembership>) -> Result<Vec<CustomerGroupMembership>, String> {
        self.repo
            .create_many(memberships)
            .await
            .map_err(|e| format!("Failed to create memberships: {}", e))
    }

    pub async fn list_by_customer(&self, customer_id: &str) -> Result<Vec<CustomerGroupMembership>, String> {
        self.repo
            .list_by_customer(customer_id)
            .await
            .map_err(|e| format!("Failed to list memberships by customer: {}", e))
    }

    pub async fn list_by_group(&self, group_id: &str) -> Result<Vec<CustomerGroupMembership>, String> {
        self.repo
            .list_by_group(group_id)
            .await
            .map_err(|e| format!("Failed to list memberships by group: {}", e))
    }

    pub async fn delete_membership(&self, customer_id: &str, group_id: &str) -> Result<(), String> {
        self.repo
            .delete(customer_id, group_id)
            .await
            .map_err(|e| format!("Failed to delete membership: {}", e))
    }

    pub async fn delete_by_customer(&self, customer_id: &str) -> Result<(), String> {
        self.repo
            .delete_by_customer_id(customer_id)
            .await
            .map_err(|e| format!("Failed to delete memberships: {}", e))
    }

    pub async fn delete_by_group(&self, group_id: &str) -> Result<(), String> {
        self.repo
            .delete_by_group_id(group_id)
            .await
            .map_err(|e| format!("Failed to delete memberships: {}", e))
    }
}
