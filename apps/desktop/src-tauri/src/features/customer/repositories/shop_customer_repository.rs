//! Shop-scoped Customer Repository for Multi-Database Architecture
//!
//! This repository operates on a shop-specific database where each shop
//! has its own isolated database file. The customers table in shop databases
//! does NOT have a shop_id column.

use crate::features::customer::models::customer_model::Customer;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, Sqlite, SqlitePool, Transaction};
use std::sync::Arc;

/// Internal struct for deserializing from shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopCustomer {
    pub id: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company_name: Option<String>,
    pub tax_id: Option<String>,
    pub tax_id_type: Option<String>,
    pub state_tax_id: Option<String>,
    pub status: Option<String>,
    pub currency: Option<String>,
    pub language: Option<String>,
    pub tags: Option<String>,
    pub accepts_marketing: Option<bool>,
    pub customer_group_id: Option<String>,
    pub total_spent: Option<f64>,
    pub orders_count: Option<i64>,
    pub last_order_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub metadata: Option<String>,
    pub custom_attributes: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl ShopCustomer {
    /// Convert to Customer with shop_id set from context
    fn into_customer(self, shop_id: String) -> Customer {
        Customer {
            id: self.id,
            shop_id,
            r#type: self.r#type,
            email: self.email,
            phone: self.phone,
            first_name: self.first_name,
            last_name: self.last_name,
            company_name: self.company_name,
            tax_id: self.tax_id,
            tax_id_type: self.tax_id_type,
            state_tax_id: self.state_tax_id,
            status: self.status,
            currency: self.currency,
            language: self.language,
            tags: self.tags,
            accepts_marketing: self.accepts_marketing,
            customer_group_id: self.customer_group_id,
            total_spent: self.total_spent,
            orders_count: self.orders_count,
            last_order_at: self.last_order_at,
            notes: self.notes,
            metadata: self.metadata,
            custom_attributes: self.custom_attributes,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

/// Customer repository that operates on a shop-specific database.
pub struct ShopCustomerRepository {
    pool: Arc<SqlitePool>,
    shop_id: String,
}

impl ShopCustomerRepository {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, customer: &Customer) -> Result<Customer> {
        let sql = r#"
            INSERT INTO customers (
                id, type, email, phone, first_name, last_name, company_name,
                tax_id, tax_id_type, state_tax_id, status, currency, language,
                tags, accepts_marketing, customer_group_id, total_spent,
                orders_count, last_order_at, notes, metadata, custom_attributes,
                _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21, $22,
                $23, $24, $25
            )
            RETURNING *
        "#;

        let shop_customer = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(&customer.id)
            .bind(&customer.r#type)
            .bind(&customer.email)
            .bind(&customer.phone)
            .bind(&customer.first_name)
            .bind(&customer.last_name)
            .bind(&customer.company_name)
            .bind(&customer.tax_id)
            .bind(&customer.tax_id_type)
            .bind(&customer.state_tax_id)
            .bind(&customer.status)
            .bind(&customer.currency)
            .bind(&customer.language)
            .bind(&customer.tags)
            .bind(&customer.accepts_marketing)
            .bind(&customer.customer_group_id)
            .bind(&customer.total_spent)
            .bind(&customer.orders_count)
            .bind(&customer.last_order_at)
            .bind(&customer.notes)
            .bind(&customer.metadata)
            .bind(&customer.custom_attributes)
            .bind(&customer.sync_status)
            .bind(&customer.created_at)
            .bind(&customer.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_customer.into_customer(self.shop_id.clone()))
    }

    pub async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        customer: &Customer,
    ) -> Result<Customer> {
        let sql = r#"
            INSERT INTO customers (
                id, type, email, phone, first_name, last_name, company_name,
                tax_id, tax_id_type, state_tax_id, status, currency, language,
                tags, accepts_marketing, customer_group_id, total_spent,
                orders_count, last_order_at, notes, metadata, custom_attributes,
                _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21, $22,
                $23, $24, $25
            )
            RETURNING *
        "#;

        let shop_customer = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(&customer.id)
            .bind(&customer.r#type)
            .bind(&customer.email)
            .bind(&customer.phone)
            .bind(&customer.first_name)
            .bind(&customer.last_name)
            .bind(&customer.company_name)
            .bind(&customer.tax_id)
            .bind(&customer.tax_id_type)
            .bind(&customer.state_tax_id)
            .bind(&customer.status)
            .bind(&customer.currency)
            .bind(&customer.language)
            .bind(&customer.tags)
            .bind(&customer.accepts_marketing)
            .bind(&customer.customer_group_id)
            .bind(&customer.total_spent)
            .bind(&customer.orders_count)
            .bind(&customer.last_order_at)
            .bind(&customer.notes)
            .bind(&customer.metadata)
            .bind(&customer.custom_attributes)
            .bind(&customer.sync_status)
            .bind(&customer.created_at)
            .bind(&customer.updated_at)
            .fetch_one(&mut **tx)
            .await?;

        Ok(shop_customer.into_customer(self.shop_id.clone()))
    }

    pub async fn update(&self, customer: &Customer) -> Result<Customer> {
        let sql = r#"
            UPDATE customers SET
                type = $2,
                email = $3,
                phone = $4,
                first_name = $5,
                last_name = $6,
                company_name = $7,
                tax_id = $8,
                tax_id_type = $9,
                state_tax_id = $10,
                status = $11,
                currency = $12,
                language = $13,
                tags = $14,
                accepts_marketing = $15,
                customer_group_id = $16,
                total_spent = $17,
                orders_count = $18,
                last_order_at = $19,
                notes = $20,
                metadata = $21,
                custom_attributes = $22,
                _status = $23,
                updated_at = $24
            WHERE id = $1
            RETURNING *
        "#;

        let shop_customer = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(&customer.id)
            .bind(&customer.r#type)
            .bind(&customer.email)
            .bind(&customer.phone)
            .bind(&customer.first_name)
            .bind(&customer.last_name)
            .bind(&customer.company_name)
            .bind(&customer.tax_id)
            .bind(&customer.tax_id_type)
            .bind(&customer.state_tax_id)
            .bind(&customer.status)
            .bind(&customer.currency)
            .bind(&customer.language)
            .bind(&customer.tags)
            .bind(&customer.accepts_marketing)
            .bind(&customer.customer_group_id)
            .bind(&customer.total_spent)
            .bind(&customer.orders_count)
            .bind(&customer.last_order_at)
            .bind(&customer.notes)
            .bind(&customer.metadata)
            .bind(&customer.custom_attributes)
            .bind(&customer.sync_status)
            .bind(&customer.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_customer.into_customer(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Customer>> {
        let sql = "SELECT * FROM customers WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_customer(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Customer>> {
        let sql = "SELECT * FROM customers WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopCustomer>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|c| c.into_customer(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE customers SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn search(&self, query_str: &str) -> Result<Vec<Customer>> {
        let sql = r#"
            SELECT * FROM customers
            WHERE (_status IS NULL OR _status != 'deleted')
              AND (first_name LIKE $1
                   OR last_name LIKE $1
                   OR email LIKE $1
                   OR company_name LIKE $1
                   OR tax_id LIKE $1
                   OR phone LIKE $1)
            ORDER BY created_at DESC
        "#;
        let search_pattern = format!("%{}%", query_str);
        let results = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(search_pattern)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|c| c.into_customer(self.shop_id.clone()))
            .collect())
    }

    pub async fn find_by_email(&self, email: &str) -> Result<Option<Customer>> {
        let sql = "SELECT * FROM customers WHERE email = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(email)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_customer(self.shop_id.clone())))
    }

    pub async fn find_by_tax_id(&self, tax_id: &str) -> Result<Option<Customer>> {
        let sql = "SELECT * FROM customers WHERE tax_id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(tax_id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_customer(self.shop_id.clone())))
    }

    /// Increment customer stats after a completed sale within a transaction
    pub async fn increment_stats_in_tx(
        tx: &mut Transaction<'_, Sqlite>,
        customer_id: &str,
        amount: f64,
        shop_id: String,
    ) -> Result<Customer> {
        let sql = r#"
            UPDATE customers
            SET total_spent = COALESCE(total_spent, 0) + $2,
                orders_count = COALESCE(orders_count, 0) + 1,
                last_order_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_customer = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(customer_id)
            .bind(amount)
            .fetch_one(&mut **tx)
            .await?;

        Ok(shop_customer.into_customer(shop_id))
    }

    /// Decrement customer stats after a return within a transaction
    pub async fn decrement_stats_in_tx(
        tx: &mut Transaction<'_, Sqlite>,
        customer_id: &str,
        amount: f64,
        shop_id: String,
    ) -> Result<Customer> {
        let sql = r#"
            UPDATE customers
            SET total_spent = MAX(0, COALESCE(total_spent, 0) - $2),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_customer = sqlx::query_as::<_, ShopCustomer>(sql)
            .bind(customer_id)
            .bind(amount)
            .fetch_one(&mut **tx)
            .await?;

        Ok(shop_customer.into_customer(shop_id))
    }
}
