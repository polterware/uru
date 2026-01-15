use crate::models::product_category::ProductCategory;
use sqlx::{Result, SqlitePool};

pub struct ProductCategoriesRepository {
    pool: SqlitePool,
}

impl ProductCategoriesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: ProductCategory) -> Result<ProductCategory> {
        let sql = r#"
            INSERT INTO product_categories (
                product_id, category_id, position, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING product_id, category_id, position, _status, created_at, updated_at
        "#;

        sqlx::query_as::<_, ProductCategory>(sql)
            .bind(item.product_id)
            .bind(item.category_id)
            .bind(item.position)
            .bind(item.status)
            .bind(item.created_at)
            .bind(item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn list_by_product(&self, product_id: &str) -> Result<Vec<ProductCategory>> {
        let sql = r#"
            SELECT product_id, category_id, position, _status, created_at, updated_at
            FROM product_categories
            WHERE product_id = $1
            ORDER BY position ASC
        "#;

        sqlx::query_as::<_, ProductCategory>(sql)
            .bind(product_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_category(&self, category_id: &str) -> Result<Vec<ProductCategory>> {
        let sql = r#"
            SELECT product_id, category_id, position, _status, created_at, updated_at
            FROM product_categories
            WHERE category_id = $1
        "#;

        sqlx::query_as::<_, ProductCategory>(sql)
            .bind(category_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, product_id: &str, category_id: &str) -> Result<()> {
        let sql = r#"
            DELETE FROM product_categories
            WHERE product_id = $1 AND category_id = $2
        "#;

        sqlx::query(sql)
            .bind(product_id)
            .bind(category_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
