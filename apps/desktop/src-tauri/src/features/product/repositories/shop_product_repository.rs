//! Shop-scoped Product Repository for Multi-Database Architecture
//!
//! This repository operates on a shop-specific database where products
//! don't have a shop_id column (it's implicit from the database context).

use crate::features::product::models::product_model::Product;
use sqlx::{QueryBuilder, Result, Sqlite, SqlitePool, Transaction};
use std::sync::Arc;

/// Product repository that operates on a shop-specific database.
///
/// In the multi-database architecture, each shop has its own database,
/// so there's no shop_id column in the products table. The shop_id is
/// tracked in memory and set on returned entities for API compatibility.
pub struct ShopProductRepository {
    pool: Arc<SqlitePool>,
    shop_id: String,
}

impl ShopProductRepository {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    /// Get the shop_id this repository is scoped to
    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    /// Set shop_id on a product (for API compatibility)
    fn with_shop_id(&self, mut product: Product) -> Product {
        product.shop_id = self.shop_id.clone();
        product
    }

    pub async fn create(&self, product: &Product) -> Result<Product> {
        let sql = r#"
            INSERT INTO products (
                id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23, $24, $25
            )
            RETURNING id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
        "#;

        let row = sqlx::query_as::<_, ShopProduct>(sql)
            .bind(&product.id)
            .bind(&product.sku)
            .bind(&product.r#type)
            .bind(&product.status)
            .bind(&product.name)
            .bind(&product.slug)
            .bind(&product.gtin_ean)
            .bind(&product.price)
            .bind(&product.promotional_price)
            .bind(&product.cost_price)
            .bind(&product.currency)
            .bind(&product.tax_ncm)
            .bind(&product.is_shippable)
            .bind(&product.weight_g)
            .bind(&product.width_mm)
            .bind(&product.height_mm)
            .bind(&product.depth_mm)
            .bind(&product.attributes)
            .bind(&product.metadata)
            .bind(&product.category_id)
            .bind(&product.brand_id)
            .bind(&product.parent_id)
            .bind(&product.sync_status)
            .bind(&product.created_at)
            .bind(&product.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(self.with_shop_id(row.into_product()))
    }

    pub async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        product: &Product,
    ) -> Result<Product> {
        let sql = r#"
            INSERT INTO products (
                id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23, $24, $25
            )
            RETURNING id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
        "#;

        let row = sqlx::query_as::<_, ShopProduct>(sql)
            .bind(&product.id)
            .bind(&product.sku)
            .bind(&product.r#type)
            .bind(&product.status)
            .bind(&product.name)
            .bind(&product.slug)
            .bind(&product.gtin_ean)
            .bind(&product.price)
            .bind(&product.promotional_price)
            .bind(&product.cost_price)
            .bind(&product.currency)
            .bind(&product.tax_ncm)
            .bind(&product.is_shippable)
            .bind(&product.weight_g)
            .bind(&product.width_mm)
            .bind(&product.height_mm)
            .bind(&product.depth_mm)
            .bind(&product.attributes)
            .bind(&product.metadata)
            .bind(&product.category_id)
            .bind(&product.brand_id)
            .bind(&product.parent_id)
            .bind(&product.sync_status)
            .bind(&product.created_at)
            .bind(&product.updated_at)
            .fetch_one(&mut **tx)
            .await?;

        Ok(self.with_shop_id(row.into_product()))
    }

    pub async fn update(&self, product: &Product) -> Result<Product> {
        let sql = r#"
            UPDATE products SET
                sku = $2,
                type = $3,
                status = $4,
                name = $5,
                slug = $6,
                gtin_ean = $7,
                price = $8,
                promotional_price = $9,
                cost_price = $10,
                currency = $11,
                tax_ncm = $12,
                is_shippable = $13,
                weight_g = $14,
                width_mm = $15,
                height_mm = $16,
                depth_mm = $17,
                attributes = $18,
                metadata = $19,
                category_id = $20,
                brand_id = $21,
                parent_id = $22,
                _status = $23,
                updated_at = $24
            WHERE id = $1
            RETURNING id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
        "#;

        let row = sqlx::query_as::<_, ShopProduct>(sql)
            .bind(&product.id)
            .bind(&product.sku)
            .bind(&product.r#type)
            .bind(&product.status)
            .bind(&product.name)
            .bind(&product.slug)
            .bind(&product.gtin_ean)
            .bind(&product.price)
            .bind(&product.promotional_price)
            .bind(&product.cost_price)
            .bind(&product.currency)
            .bind(&product.tax_ncm)
            .bind(&product.is_shippable)
            .bind(&product.weight_g)
            .bind(&product.width_mm)
            .bind(&product.height_mm)
            .bind(&product.depth_mm)
            .bind(&product.attributes)
            .bind(&product.metadata)
            .bind(&product.category_id)
            .bind(&product.brand_id)
            .bind(&product.parent_id)
            .bind(&product.sync_status)
            .bind(&product.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(self.with_shop_id(row.into_product()))
    }

    pub async fn soft_delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE products SET _status = 'deleted', updated_at = datetime('now') WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Product>> {
        let sql = "SELECT id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
            currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
            attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            FROM products WHERE id = $1 AND _status != 'deleted'";

        let row = sqlx::query_as::<_, ShopProduct>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(row.map(|r| self.with_shop_id(r.into_product())))
    }

    pub async fn list(&self) -> Result<Vec<Product>> {
        let sql = "SELECT id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
            currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
            attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            FROM products WHERE _status != 'deleted' ORDER BY created_at DESC";

        let rows = sqlx::query_as::<_, ShopProduct>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| self.with_shop_id(r.into_product()))
            .collect())
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn list_filtered(
        &self,
        status: Option<&str>,
        category_id: Option<&str>,
        brand_id: Option<&str>,
        query: Option<&str>,
        is_shippable: Option<bool>,
        min_price: Option<f64>,
        max_price: Option<f64>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Product>> {
        let mut builder = QueryBuilder::<Sqlite>::new(
            "SELECT id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
            currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
            attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            FROM products WHERE _status != 'deleted'"
        );

        if let Some(status) = status {
            builder.push(" AND status = ");
            builder.push_bind(status);
        }

        if let Some(category_id) = category_id {
            builder.push(" AND category_id = ");
            builder.push_bind(category_id);
        }

        if let Some(brand_id) = brand_id {
            builder.push(" AND brand_id = ");
            builder.push_bind(brand_id);
        }

        if let Some(query) = query {
            let pattern = format!("%{}%", query);
            builder.push(" AND (name LIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR sku LIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR gtin_ean LIKE ");
            builder.push_bind(pattern);
            builder.push(")");
        }

        if let Some(is_shippable) = is_shippable {
            builder.push(" AND is_shippable = ");
            builder.push_bind(is_shippable);
        }

        if let Some(min_price) = min_price {
            builder.push(" AND price >= ");
            builder.push_bind(min_price);
        }

        if let Some(max_price) = max_price {
            builder.push(" AND price <= ");
            builder.push_bind(max_price);
        }

        builder.push(" ORDER BY created_at DESC");
        builder.push(" LIMIT ");
        builder.push_bind(limit);
        builder.push(" OFFSET ");
        builder.push_bind(offset);

        let query = builder.build_query_as::<ShopProduct>();
        let rows = query.fetch_all(&*self.pool).await?;

        Ok(rows
            .into_iter()
            .map(|r| self.with_shop_id(r.into_product()))
            .collect())
    }

    pub async fn search(&self, query_str: &str) -> Result<Vec<Product>> {
        let sql = r#"
            SELECT id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            FROM products
            WHERE _status != 'deleted'
              AND (name LIKE $1 OR sku LIKE $1 OR gtin_ean LIKE $1)
            ORDER BY created_at DESC
        "#;
        let search_pattern = format!("%{}%", query_str);
        let rows = sqlx::query_as::<_, ShopProduct>(sql)
            .bind(search_pattern)
            .fetch_all(&*self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|r| self.with_shop_id(r.into_product()))
            .collect())
    }
}

/// Internal struct for deserializing products from shop database (no shop_id column)
#[derive(Debug, sqlx::FromRow)]
struct ShopProduct {
    pub id: String,
    pub sku: String,
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub status: Option<String>,
    pub name: String,
    pub slug: String,
    pub gtin_ean: Option<String>,
    pub price: f64,
    pub promotional_price: Option<f64>,
    pub cost_price: Option<f64>,
    pub currency: Option<String>,
    pub tax_ncm: Option<String>,
    pub is_shippable: bool,
    pub weight_g: i64,
    pub width_mm: i64,
    pub height_mm: i64,
    pub depth_mm: i64,
    pub attributes: Option<String>,
    pub metadata: Option<String>,
    pub category_id: Option<String>,
    pub brand_id: Option<String>,
    pub parent_id: Option<String>,
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl ShopProduct {
    /// Convert to Product with empty shop_id (to be filled by repository)
    fn into_product(self) -> Product {
        Product {
            id: self.id,
            shop_id: String::new(), // Will be set by repository
            sku: self.sku,
            r#type: self.r#type,
            status: self.status,
            name: self.name,
            slug: self.slug,
            gtin_ean: self.gtin_ean,
            price: self.price,
            promotional_price: self.promotional_price,
            cost_price: self.cost_price,
            currency: self.currency,
            tax_ncm: self.tax_ncm,
            is_shippable: self.is_shippable,
            weight_g: self.weight_g,
            width_mm: self.width_mm,
            height_mm: self.height_mm,
            depth_mm: self.depth_mm,
            attributes: self.attributes,
            metadata: self.metadata,
            category_id: self.category_id,
            brand_id: self.brand_id,
            parent_id: self.parent_id,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}
