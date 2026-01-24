//! Shop-scoped Brand Repository for Multi-Database Architecture
//!
//! This repository operates on a shop-specific database where each shop
//! has its own isolated database file. The brands table in shop databases
//! does NOT have a shop_id column.

use crate::features::brand::models::brand_model::Brand;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, SqlitePool};
use std::sync::Arc;

/// Internal struct for deserializing from shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopBrand {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub logo_url: Option<String>,
    pub banner_url: Option<String>,
    pub description: Option<String>,
    pub rich_description: Option<String>,
    pub website_url: Option<String>,
    pub status: String,
    pub is_featured: bool,
    pub sort_order: i32,
    pub seo_title: Option<String>,
    pub seo_keywords: Option<String>,
    pub metadata: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ShopBrand {
    /// Convert to Brand with shop_id set from context
    fn into_brand(self, shop_id: String) -> Brand {
        Brand {
            id: self.id,
            shop_id,
            name: self.name,
            slug: self.slug,
            logo_url: self.logo_url,
            banner_url: self.banner_url,
            description: self.description,
            rich_description: self.rich_description,
            website_url: self.website_url,
            status: self.status,
            is_featured: self.is_featured,
            sort_order: self.sort_order,
            seo_title: self.seo_title,
            seo_keywords: self.seo_keywords,
            metadata: self.metadata,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

/// Brand repository that operates on a shop-specific database.
pub struct ShopBrandRepository {
    pool: Arc<SqlitePool>,
    shop_id: String,
}

impl ShopBrandRepository {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, brand: &Brand) -> Result<Brand> {
        let sql = r#"
            INSERT INTO brands (
                id, name, slug, logo_url, banner_url, description, rich_description,
                website_url, status, is_featured, sort_order, seo_title, seo_keywords,
                metadata, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        "#;

        let shop_brand = sqlx::query_as::<_, ShopBrand>(sql)
            .bind(&brand.id)
            .bind(&brand.name)
            .bind(&brand.slug)
            .bind(&brand.logo_url)
            .bind(&brand.banner_url)
            .bind(&brand.description)
            .bind(&brand.rich_description)
            .bind(&brand.website_url)
            .bind(&brand.status)
            .bind(brand.is_featured)
            .bind(brand.sort_order)
            .bind(&brand.seo_title)
            .bind(&brand.seo_keywords)
            .bind(&brand.metadata)
            .bind(&brand.sync_status)
            .bind(brand.created_at)
            .bind(brand.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_brand.into_brand(self.shop_id.clone()))
    }

    pub async fn update(&self, brand: &Brand) -> Result<Brand> {
        let sql = r#"
            UPDATE brands SET
                name = $2, slug = $3, logo_url = $4, banner_url = $5, description = $6,
                rich_description = $7, website_url = $8, status = $9, is_featured = $10,
                sort_order = $11, seo_title = $12, seo_keywords = $13, metadata = $14,
                _status = $15, updated_at = $16
            WHERE id = $1
            RETURNING *
        "#;

        let shop_brand = sqlx::query_as::<_, ShopBrand>(sql)
            .bind(&brand.id)
            .bind(&brand.name)
            .bind(&brand.slug)
            .bind(&brand.logo_url)
            .bind(&brand.banner_url)
            .bind(&brand.description)
            .bind(&brand.rich_description)
            .bind(&brand.website_url)
            .bind(&brand.status)
            .bind(brand.is_featured)
            .bind(brand.sort_order)
            .bind(&brand.seo_title)
            .bind(&brand.seo_keywords)
            .bind(&brand.metadata)
            .bind(&brand.sync_status)
            .bind(brand.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_brand.into_brand(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Brand>> {
        let sql = "SELECT * FROM brands WHERE id = $1 AND _status != 'deleted'";
        let result = sqlx::query_as::<_, ShopBrand>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|b| b.into_brand(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Brand>> {
        let sql = "SELECT * FROM brands WHERE _status != 'deleted' ORDER BY sort_order ASC, name ASC";
        let results = sqlx::query_as::<_, ShopBrand>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|b| b.into_brand(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE brands SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn find_by_slug(&self, slug: &str) -> Result<Option<Brand>> {
        let sql = "SELECT * FROM brands WHERE slug = $1 AND _status != 'deleted'";
        let result = sqlx::query_as::<_, ShopBrand>(sql)
            .bind(slug)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|b| b.into_brand(self.shop_id.clone())))
    }

    pub async fn list_featured(&self) -> Result<Vec<Brand>> {
        let sql = "SELECT * FROM brands WHERE is_featured = 1 AND _status != 'deleted' ORDER BY sort_order ASC";
        let results = sqlx::query_as::<_, ShopBrand>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|b| b.into_brand(self.shop_id.clone()))
            .collect())
    }
}
