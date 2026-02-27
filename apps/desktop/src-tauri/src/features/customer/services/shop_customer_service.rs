//! Shop-scoped Customer Service for Multi-Database Architecture
//!
//! This service operates on a shop-specific database where each shop
//! has its own isolated database file.

use crate::features::customer::dtos::customer_dto::{CreateCustomerDTO, UpdateCustomerDTO};
use crate::features::customer::models::customer_model::Customer;
use crate::features::customer::repositories::shop_customer_repository::ShopCustomerRepository;
use sqlx::AnyPool;
use std::sync::Arc;

/// Customer service that operates on a shop-specific database.
pub struct ShopCustomerService {
    pool: Arc<AnyPool>,
    shop_id: String,
    repo: ShopCustomerRepository,
}

impl ShopCustomerService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopCustomerRepository::new(pool.clone(), shop_id.clone());
        Self {
            pool,
            shop_id,
            repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub async fn create_customer(&self, payload: CreateCustomerDTO) -> Result<Customer, String> {
        let (customer, addresses, memberships) = payload.into_models();

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        // Create customer
        let created_customer = self
            .repo
            .create_in_tx(&mut tx, &customer)
            .await
            .map_err(|e| format!("Failed to create customer: {}", e))?;

        // Create addresses if any
        if !addresses.is_empty() {
            for addr in addresses {
                sqlx::query(
                    r#"
                    INSERT INTO customer_addresses (
                        id, customer_id, type, is_default, first_name, last_name, company,
                        address1, address2, city, province_code, country_code, postal_code,
                        phone, metadata, _status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                "#,
                )
                .bind(&addr.id)
                .bind(&addr.customer_id)
                .bind(&addr.r#type)
                .bind(&addr.is_default)
                .bind(&addr.first_name)
                .bind(&addr.last_name)
                .bind(&addr.company)
                .bind(&addr.address1)
                .bind(&addr.address2)
                .bind(&addr.city)
                .bind(&addr.province_code)
                .bind(&addr.country_code)
                .bind(&addr.postal_code)
                .bind(&addr.phone)
                .bind(&addr.metadata)
                .bind(&addr.sync_status)
                .bind(&addr.created_at)
                .bind(&addr.updated_at)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to create addresses: {}", e))?;
            }
        }

        // Create memberships if any
        if !memberships.is_empty() {
            for membership in memberships {
                sqlx::query(
                    r#"
                    INSERT INTO customer_group_memberships (
                        customer_id, customer_group_id, _status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5)
                "#,
                )
                .bind(&membership.customer_id)
                .bind(&membership.customer_group_id)
                .bind(&membership.sync_status)
                .bind(&membership.created_at)
                .bind(&membership.updated_at)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to create memberships: {}", e))?;
            }
        }

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(created_customer)
    }

    pub async fn update_customer(&self, payload: UpdateCustomerDTO) -> Result<Customer, String> {
        let customer = payload.into_models();
        self.repo
            .update(&customer)
            .await
            .map_err(|e| format!("Failed to update customer: {}", e))
    }

    pub async fn delete_customer(&self, id: &str) -> Result<(), String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        // Soft delete addresses
        sqlx::query(
            "UPDATE customer_addresses SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1",
        )
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete addresses: {}", e))?;

        // Soft delete memberships
        sqlx::query(
            "UPDATE customer_group_memberships SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1",
        )
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete memberships: {}", e))?;

        // Soft delete customer
        sqlx::query(
            "UPDATE customers SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        )
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete customer: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(())
    }

    pub async fn get_customer(&self, id: &str) -> Result<Option<Customer>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch customer: {}", e))
    }

    pub async fn list_customers(&self) -> Result<Vec<Customer>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list customers: {}", e))
    }

    pub async fn search_customers(&self, query: &str) -> Result<Vec<Customer>, String> {
        self.repo
            .search(query)
            .await
            .map_err(|e| format!("Failed to search customers: {}", e))
    }

    pub async fn find_by_email(&self, email: &str) -> Result<Option<Customer>, String> {
        self.repo
            .find_by_email(email)
            .await
            .map_err(|e| format!("Failed to find customer by email: {}", e))
    }

    pub async fn find_by_tax_id(&self, tax_id: &str) -> Result<Option<Customer>, String> {
        self.repo
            .find_by_tax_id(tax_id)
            .await
            .map_err(|e| format!("Failed to find customer by tax_id: {}", e))
    }
}
