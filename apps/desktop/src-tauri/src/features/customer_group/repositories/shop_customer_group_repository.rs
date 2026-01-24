//! Shop-scoped Customer Group Repository for Multi-Database Architecture

use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, SqlitePool};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopCustomerGroup {
    pub id: String,
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>,
    pub rules: Option<String>,
    pub default_discount_percentage: Option<f64>,
    pub price_list_id: Option<String>,
    pub tax_class: Option<String>,
    pub allowed_payment_methods: Option<String>,
    pub min_order_amount: Option<f64>,
    pub metadata: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl ShopCustomerGroup {
    fn into_customer_group(self, shop_id: String) -> CustomerGroup {
        CustomerGroup {
            id: self.id,
            shop_id,
            name: self.name,
            code: self.code,
            description: self.description,
            r#type: self.r#type,
            rules: self.rules,
            default_discount_percentage: self.default_discount_percentage,
            price_list_id: self.price_list_id,
            tax_class: self.tax_class,
            allowed_payment_methods: self.allowed_payment_methods,
            min_order_amount: self.min_order_amount,
            metadata: self.metadata,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

pub struct ShopCustomerGroupRepository {
    pool: Arc<SqlitePool>,
    shop_id: String,
}

impl ShopCustomerGroupRepository {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, group: &CustomerGroup) -> Result<CustomerGroup> {
        let sql = r#"
            INSERT INTO customer_groups (
                id, name, code, description, type, rules,
                default_discount_percentage, price_list_id, tax_class,
                allowed_payment_methods, min_order_amount, metadata,
                _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )
            RETURNING *
        "#;

        let shop_group = sqlx::query_as::<_, ShopCustomerGroup>(sql)
            .bind(&group.id)
            .bind(&group.name)
            .bind(&group.code)
            .bind(&group.description)
            .bind(&group.r#type)
            .bind(&group.rules)
            .bind(&group.default_discount_percentage)
            .bind(&group.price_list_id)
            .bind(&group.tax_class)
            .bind(&group.allowed_payment_methods)
            .bind(&group.min_order_amount)
            .bind(&group.metadata)
            .bind(&group.sync_status)
            .bind(&group.created_at)
            .bind(&group.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_group.into_customer_group(self.shop_id.clone()))
    }

    pub async fn update(&self, group: &CustomerGroup) -> Result<CustomerGroup> {
        let sql = r#"
            UPDATE customer_groups SET
                name = $2,
                code = $3,
                description = $4,
                type = $5,
                rules = $6,
                default_discount_percentage = $7,
                price_list_id = $8,
                tax_class = $9,
                allowed_payment_methods = $10,
                min_order_amount = $11,
                metadata = $12,
                _status = 'modified',
                updated_at = datetime('now')
            WHERE id = $1
            RETURNING *
        "#;

        let shop_group = sqlx::query_as::<_, ShopCustomerGroup>(sql)
            .bind(&group.id)
            .bind(&group.name)
            .bind(&group.code)
            .bind(&group.description)
            .bind(&group.r#type)
            .bind(&group.rules)
            .bind(&group.default_discount_percentage)
            .bind(&group.price_list_id)
            .bind(&group.tax_class)
            .bind(&group.allowed_payment_methods)
            .bind(&group.min_order_amount)
            .bind(&group.metadata)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_group.into_customer_group(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<CustomerGroup>> {
        let sql = "SELECT * FROM customer_groups WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCustomerGroup>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|g| g.into_customer_group(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<CustomerGroup>> {
        let sql = "SELECT * FROM customer_groups WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopCustomerGroup>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|g| g.into_customer_group(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE customer_groups SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }
}
