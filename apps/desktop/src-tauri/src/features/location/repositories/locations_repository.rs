use crate::features::location::models::location_model::Location;
use sqlx::{Result, AnyPool};

pub struct LocationsRepository {
    pool: AnyPool,
}

impl LocationsRepository {
    pub fn new(pool: AnyPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: Location) -> Result<Location> {
        let sql = r#"
            INSERT INTO locations (
                id, shop_id, name, type, is_sellable, address_data, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(&item.id)
            .bind(&item.shop_id)
            .bind(&item.name)
            .bind(&item.type_)
            .bind(&item.is_sellable)
            .bind(&item.address_data)
            .bind(&item.sync_status)
            .bind(&item.created_at)
            .bind(&item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: Location) -> Result<Location> {
        let sql = r#"
            UPDATE locations SET
                name = $2,
                type = $3,
                is_sellable = $4,
                address_data = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND shop_id = $6
            RETURNING *
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(&item.id)
            .bind(&item.name)
            .bind(&item.type_)
            .bind(&item.is_sellable)
            .bind(&item.address_data)
            .bind(&item.shop_id)
            .fetch_one(&self.pool)
            .await
    }

    /// List all locations for a specific shop (primary method for multi-tenancy)
    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Location>> {
        let sql = r#"
            SELECT * FROM locations
            WHERE shop_id = $1 AND _status != 'deleted'
            ORDER BY name ASC
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    /// Get a location by ID, ensuring it belongs to the specified shop
    pub async fn get_by_id_for_shop(&self, shop_id: &str, id: &str) -> Result<Option<Location>> {
        let sql = r#"
            SELECT * FROM locations
            WHERE id = $1 AND shop_id = $2 AND _status != 'deleted'
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(id)
            .bind(shop_id)
            .fetch_optional(&self.pool)
            .await
    }

    /// Get a location by ID (without shop verification - use with caution)
    pub async fn get_by_id(&self, id: &str) -> Result<Option<Location>> {
        let sql = r#"
            SELECT * FROM locations WHERE id = $1 AND _status != 'deleted'
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    /// Soft delete a location
    pub async fn delete(&self, shop_id: &str, id: &str) -> Result<()> {
        let sql = r#"
            UPDATE locations SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND shop_id = $2
        "#;

        sqlx::query(sql)
            .bind(id)
            .bind(shop_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    /// List locations by type for a specific shop
    pub async fn list_by_type(&self, shop_id: &str, location_type: &str) -> Result<Vec<Location>> {
        let sql = r#"
            SELECT * FROM locations
            WHERE shop_id = $1 AND type = $2 AND _status != 'deleted'
            ORDER BY name ASC
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(shop_id)
            .bind(location_type)
            .fetch_all(&self.pool)
            .await
    }

    /// List only sellable locations for a specific shop
    pub async fn list_sellable(&self, shop_id: &str) -> Result<Vec<Location>> {
        let sql = r#"
            SELECT * FROM locations
            WHERE shop_id = $1 AND is_sellable = 1 AND _status != 'deleted'
            ORDER BY name ASC
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }
}
