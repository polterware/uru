//! Shop-scoped Category Repository for Multi-Database Architecture
//!
//! This repository operates on a shop-specific database where each shop
//! has its own isolated database file. The categories table in shop databases
//! does NOT have a shop_id column.

use crate::features::category::models::category_model::Category;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, AnyPool};
use std::sync::Arc;

/// Internal struct for deserializing from shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopCategory {
    pub id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub banner_url: Option<String>,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>,
    pub rules: Option<String>,
    pub is_visible: bool,
    pub sort_order: i64,
    pub seo_title: Option<String>,
    pub seo_description: Option<String>,
    pub template_suffix: Option<String>,
    pub metadata: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl ShopCategory {
    /// Convert to Category with shop_id set from context
    fn into_category(self, shop_id: String) -> Category {
        Category {
            id: self.id,
            shop_id,
            parent_id: self.parent_id,
            name: self.name,
            slug: self.slug,
            description: self.description,
            image_url: self.image_url,
            banner_url: self.banner_url,
            r#type: self.r#type,
            rules: self.rules,
            is_visible: self.is_visible,
            sort_order: self.sort_order,
            seo_title: self.seo_title,
            seo_description: self.seo_description,
            template_suffix: self.template_suffix,
            metadata: self.metadata,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

/// Category repository that operates on a shop-specific database.
pub struct ShopCategoryRepository {
    pool: Arc<AnyPool>,
    shop_id: String,
}

impl ShopCategoryRepository {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, category: &Category) -> Result<Category> {
        let sql = r#"
            INSERT INTO categories (
                id, parent_id, name, slug, description, image_url, banner_url,
                type, rules, is_visible, sort_order, seo_title, seo_description,
                template_suffix, metadata, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        "#;

        let shop_category = sqlx::query_as::<_, ShopCategory>(sql)
            .bind(&category.id)
            .bind(&category.parent_id)
            .bind(&category.name)
            .bind(&category.slug)
            .bind(&category.description)
            .bind(&category.image_url)
            .bind(&category.banner_url)
            .bind(&category.r#type)
            .bind(&category.rules)
            .bind(category.is_visible)
            .bind(category.sort_order)
            .bind(&category.seo_title)
            .bind(&category.seo_description)
            .bind(&category.template_suffix)
            .bind(&category.metadata)
            .bind(&category.sync_status)
            .bind(category.created_at)
            .bind(category.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_category.into_category(self.shop_id.clone()))
    }

    pub async fn update(&self, category: &Category) -> Result<Category> {
        let sql = r#"
            UPDATE categories SET
                parent_id = $2, name = $3, slug = $4, description = $5,
                image_url = $6, banner_url = $7, type = $8, rules = $9, is_visible = $10,
                sort_order = $11, seo_title = $12, seo_description = $13, template_suffix = $14,
                metadata = $15, _status = $16, updated_at = $17
            WHERE id = $1
            RETURNING *
        "#;

        let shop_category = sqlx::query_as::<_, ShopCategory>(sql)
            .bind(&category.id)
            .bind(&category.parent_id)
            .bind(&category.name)
            .bind(&category.slug)
            .bind(&category.description)
            .bind(&category.image_url)
            .bind(&category.banner_url)
            .bind(&category.r#type)
            .bind(&category.rules)
            .bind(category.is_visible)
            .bind(category.sort_order)
            .bind(&category.seo_title)
            .bind(&category.seo_description)
            .bind(&category.template_suffix)
            .bind(&category.metadata)
            .bind(&category.sync_status)
            .bind(category.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_category.into_category(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Category>> {
        let sql = "SELECT * FROM categories WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCategory>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_category(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Category>> {
        let sql = "SELECT * FROM categories WHERE _status IS NULL OR _status != 'deleted' ORDER BY sort_order ASC";
        let results = sqlx::query_as::<_, ShopCategory>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|c| c.into_category(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE categories SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn find_by_slug(&self, slug: &str) -> Result<Option<Category>> {
        let sql = "SELECT * FROM categories WHERE slug = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCategory>(sql)
            .bind(slug)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_category(self.shop_id.clone())))
    }

    pub async fn list_by_parent(&self, parent_id: Option<&str>) -> Result<Vec<Category>> {
        let sql = match parent_id {
            Some(_) => "SELECT * FROM categories WHERE parent_id = $1 AND (_status IS NULL OR _status != 'deleted') ORDER BY sort_order ASC",
            None => "SELECT * FROM categories WHERE parent_id IS NULL AND (_status IS NULL OR _status != 'deleted') ORDER BY sort_order ASC",
        };

        let results = if let Some(pid) = parent_id {
            sqlx::query_as::<_, ShopCategory>(sql)
                .bind(pid)
                .fetch_all(&*self.pool)
                .await?
        } else {
            sqlx::query_as::<_, ShopCategory>(sql)
                .fetch_all(&*self.pool)
                .await?
        };

        Ok(results
            .into_iter()
            .map(|c| c.into_category(self.shop_id.clone()))
            .collect())
    }

    pub async fn list_visible(&self) -> Result<Vec<Category>> {
        let sql = "SELECT * FROM categories WHERE is_visible = 1 AND (_status IS NULL OR _status != 'deleted') ORDER BY sort_order ASC";
        let results = sqlx::query_as::<_, ShopCategory>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|c| c.into_category(self.shop_id.clone()))
            .collect())
    }
}
