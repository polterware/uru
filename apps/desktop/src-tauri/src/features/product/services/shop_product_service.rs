//! Shop-scoped Product Service for Multi-Database Architecture
//!
//! This service operates on a shop-specific database where each shop
//! has its own isolated database file.

use crate::features::product::dtos::product_dto::{CreateProductDTO, ProductListFilterDTO, UpdateProductDTO};
use crate::features::product::models::product_model::Product;
use crate::features::product::repositories::shop_product_categories_repository::ShopProductCategoriesRepository;
use crate::features::product::repositories::shop_product_repository::ShopProductRepository;
use sqlx::AnyPool;
use std::sync::Arc;

/// Product service that operates on a shop-specific database.
pub struct ShopProductService {
    pool: Arc<AnyPool>,
    shop_id: String,
    repo: ShopProductRepository,
    categories_repo: ShopProductCategoriesRepository,
}

impl ShopProductService {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        let repo = ShopProductRepository::new(pool.clone(), shop_id.clone());
        let categories_repo = ShopProductCategoriesRepository::new(pool.clone());
        Self {
            pool,
            shop_id,
            repo,
            categories_repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub async fn create_product(&self, payload: CreateProductDTO) -> Result<Product, String> {
        let (product, categories) = payload.into_models();

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        let created_product = self
            .repo
            .create_in_tx(&mut tx, &product)
            .await
            .map_err(|e| format!("Failed to create product: {}", e))?;

        if !categories.is_empty() {
            self.categories_repo
                .create_many_in_tx(&mut tx, categories)
                .await
                .map_err(|e| format!("Failed to create product categories: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(created_product)
    }

    pub async fn update_product(&self, payload: UpdateProductDTO) -> Result<Product, String> {
        // Get existing product to merge updates
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch product: {}", e))?
            .ok_or_else(|| format!("Product not found: {}", payload.id))?;

        // Merge updates into existing product
        let updated = merge_product_update(existing, payload);

        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update product: {}", e))
    }

    pub async fn delete_product(&self, id: &str) -> Result<(), String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        // Delete product categories
        sqlx::query("DELETE FROM product_categories WHERE product_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to delete product categories: {}", e))?;

        // Soft delete product
        sqlx::query("UPDATE products SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to delete product: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(())
    }

    pub async fn get_product(&self, id: &str) -> Result<Option<Product>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch product: {}", e))
    }

    pub async fn list_products(&self) -> Result<Vec<Product>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list products: {}", e))
    }

    pub async fn list_products_filtered(
        &self,
        filters: ProductListFilterDTO,
    ) -> Result<Vec<Product>, String> {
        let page = filters.page.unwrap_or(1).max(1);
        let per_page = filters.per_page.unwrap_or(20).clamp(1, 100);
        let offset = ((page - 1) * per_page) as i64;

        self.repo
            .list_filtered(
                filters.status.as_deref(),
                filters.category_id.as_deref(),
                filters.brand_id.as_deref(),
                filters.query.as_deref(),
                filters.is_shippable,
                filters.min_price,
                filters.max_price,
                per_page as i64,
                offset,
            )
            .await
            .map_err(|e| format!("Failed to list filtered products: {}", e))
    }

    pub async fn search_products(&self, query: &str) -> Result<Vec<Product>, String> {
        self.repo
            .search(query)
            .await
            .map_err(|e| format!("Failed to search products: {}", e))
    }
}

/// Helper function to merge update DTO into existing product
fn merge_product_update(mut product: Product, update: UpdateProductDTO) -> Product {
    if let Some(sku) = update.sku {
        product.sku = sku;
    }
    if let Some(r#type) = update.r#type {
        product.r#type = r#type;
    }
    if let Some(status) = update.status {
        product.status = Some(status);
    }
    if let Some(name) = update.name {
        product.name = name;
    }
    if let Some(slug) = update.slug {
        product.slug = slug;
    }
    if update.gtin_ean.is_some() {
        product.gtin_ean = update.gtin_ean;
    }
    if let Some(price) = update.price {
        product.price = price;
    }
    if update.promotional_price.is_some() {
        product.promotional_price = update.promotional_price;
    }
    if update.cost_price.is_some() {
        product.cost_price = update.cost_price;
    }
    if update.currency.is_some() {
        product.currency = update.currency;
    }
    if update.tax_ncm.is_some() {
        product.tax_ncm = update.tax_ncm;
    }
    if let Some(is_shippable) = update.is_shippable {
        product.is_shippable = is_shippable;
    }
    if let Some(weight_g) = update.weight_g {
        product.weight_g = weight_g;
    }
    if let Some(width_mm) = update.width_mm {
        product.width_mm = width_mm;
    }
    if let Some(height_mm) = update.height_mm {
        product.height_mm = height_mm;
    }
    if let Some(depth_mm) = update.depth_mm {
        product.depth_mm = depth_mm;
    }
    if update.attributes.is_some() {
        product.attributes = update.attributes;
    }
    if update.metadata.is_some() {
        product.metadata = update.metadata;
    }
    if update.category_id.is_some() {
        product.category_id = update.category_id;
    }
    if update.brand_id.is_some() {
        product.brand_id = update.brand_id;
    }
    if update.parent_id.is_some() {
        product.parent_id = update.parent_id;
    }

    product.sync_status = Some("modified".to_string());
    product.updated_at = Some(chrono::Utc::now());

    product
}
