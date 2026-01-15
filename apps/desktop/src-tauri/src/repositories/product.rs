use crate::models::product::Product;
use sqlx::{Sqlite, Pool, query, query_as};

pub struct ProductRepository {
    pool: Pool<Sqlite>,
}

impl ProductRepository {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, product: Product) -> Result<String, sqlx::Error> {
        let sql = r#"
            INSERT INTO products (
                id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23, $24, $25
            )
        "#;

        query(sql)
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
            .execute(&self.pool)
            .await?;

        Ok(product.id)
    }

    pub async fn update(&self, product: Product) -> Result<Product, sqlx::Error> {
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
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;

        let updated_product = query_as::<_, Product>(sql)
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
            .fetch_one(&self.pool)
            .await?;

        Ok(updated_product)
    }

    pub async fn delete(&self, id: &str) -> Result<(), sqlx::Error> {
        let sql = "DELETE FROM products WHERE id = $1";
        query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Product>, sqlx::Error> {
        let sql = "SELECT * FROM products WHERE id = $1";
        let product = query_as::<_, Product>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(product)
    }

    pub async fn list(&self) -> Result<Vec<Product>, sqlx::Error> {
        let sql = "SELECT * FROM products ORDER BY created_at DESC";
        let products = query_as::<_, Product>(sql)
            .fetch_all(&self.pool)
            .await?;
        Ok(products)
    }

    pub async fn search(&self, query_str: &str) -> Result<Vec<Product>, sqlx::Error> {
        let sql = "SELECT * FROM products WHERE name LIKE $1 OR sku LIKE $1 OR gtin_ean LIKE $1";
        let search_pattern = format!("%{}%", query_str);
        let products = query_as::<_, Product>(sql)
            .bind(search_pattern)
            .fetch_all(&self.pool)
            .await?;
        Ok(products)
    }
}
