//! Shop-scoped Customer Address Repository for Multi-Database Architecture

use crate::features::customer::models::customer_model::CustomerAddress;
use sqlx::{Result, SqlitePool};
use std::sync::Arc;

pub struct ShopCustomerAddressRepository {
    pool: Arc<SqlitePool>,
}

impl ShopCustomerAddressRepository {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, address: &CustomerAddress) -> Result<CustomerAddress> {
        let sql = r#"
            INSERT INTO customer_addresses (
                id, customer_id, type, is_default, first_name, last_name, company,
                address1, address2, city, province_code, country_code, postal_code,
                phone, metadata, _status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        "#;
        sqlx::query_as::<_, CustomerAddress>(sql)
            .bind(&address.id)
            .bind(&address.customer_id)
            .bind(&address.r#type)
            .bind(&address.is_default)
            .bind(&address.first_name)
            .bind(&address.last_name)
            .bind(&address.company)
            .bind(&address.address1)
            .bind(&address.address2)
            .bind(&address.city)
            .bind(&address.province_code)
            .bind(&address.country_code)
            .bind(&address.postal_code)
            .bind(&address.phone)
            .bind(&address.metadata)
            .bind(&address.sync_status)
            .bind(&address.created_at)
            .bind(&address.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn create_many(&self, addresses: Vec<CustomerAddress>) -> Result<Vec<CustomerAddress>> {
        let mut tx = self.pool.begin().await?;
        let mut created_addresses = Vec::new();

        for addr in addresses {
            let sql = r#"
                INSERT INTO customer_addresses (
                    id, customer_id, type, is_default, first_name, last_name, company,
                    address1, address2, city, province_code, country_code, postal_code,
                    phone, metadata, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                RETURNING *
            "#;
            let created_addr = sqlx::query_as::<_, CustomerAddress>(sql)
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
                .fetch_one(&mut *tx)
                .await?;

            created_addresses.push(created_addr);
        }

        tx.commit().await?;
        Ok(created_addresses)
    }

    pub async fn update(&self, address: &CustomerAddress) -> Result<CustomerAddress> {
        let sql = r#"
            UPDATE customer_addresses SET
                customer_id = $2,
                type = $3,
                is_default = $4,
                first_name = $5,
                last_name = $6,
                company = $7,
                address1 = $8,
                address2 = $9,
                city = $10,
                province_code = $11,
                country_code = $12,
                postal_code = $13,
                phone = $14,
                metadata = $15,
                _status = $16,
                updated_at = $17
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, CustomerAddress>(sql)
            .bind(&address.id)
            .bind(&address.customer_id)
            .bind(&address.r#type)
            .bind(&address.is_default)
            .bind(&address.first_name)
            .bind(&address.last_name)
            .bind(&address.company)
            .bind(&address.address1)
            .bind(&address.address2)
            .bind(&address.city)
            .bind(&address.province_code)
            .bind(&address.country_code)
            .bind(&address.postal_code)
            .bind(&address.phone)
            .bind(&address.metadata)
            .bind(&address.sync_status)
            .bind(&address.updated_at)
            .fetch_one(&*self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<CustomerAddress>> {
        let sql = "SELECT * FROM customer_addresses WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, CustomerAddress>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<CustomerAddress>> {
        let sql = "SELECT * FROM customer_addresses WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        sqlx::query_as::<_, CustomerAddress>(sql)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn list_by_customer(&self, customer_id: &str) -> Result<Vec<CustomerAddress>> {
        let sql = "SELECT * FROM customer_addresses WHERE customer_id = $1 AND (_status IS NULL OR _status != 'deleted')";
        sqlx::query_as::<_, CustomerAddress>(sql)
            .bind(customer_id)
            .fetch_all(&*self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE customer_addresses SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn delete_by_customer_id(&self, customer_id: &str) -> Result<()> {
        let sql = "UPDATE customer_addresses SET _status = 'deleted', updated_at = datetime('now') WHERE customer_id = $1";
        sqlx::query(sql)
            .bind(customer_id)
            .execute(&*self.pool)
            .await?;
        Ok(())
    }
}
