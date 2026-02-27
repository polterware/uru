//! Shop-scoped Location Repository for Multi-Database Architecture

use crate::features::location::models::location_model::Location;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, AnyPool};
use std::sync::Arc;

/// Internal struct for deserializing from shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopLocation {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub type_: String,
    pub is_sellable: bool,
    pub address_data: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl ShopLocation {
    fn into_location(self, shop_id: String) -> Location {
        Location {
            id: self.id,
            shop_id,
            name: self.name,
            type_: self.type_,
            is_sellable: self.is_sellable,
            address_data: self.address_data,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

pub struct ShopLocationRepository {
    pool: Arc<AnyPool>,
    shop_id: String,
}

impl ShopLocationRepository {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, item: &Location) -> Result<Location> {
        let sql = r#"
            INSERT INTO locations (
                id, name, type, is_sellable, address_data, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        "#;

        let shop_location = sqlx::query_as::<_, ShopLocation>(sql)
            .bind(&item.id)
            .bind(&item.name)
            .bind(&item.type_)
            .bind(item.is_sellable)
            .bind(&item.address_data)
            .bind(&item.sync_status)
            .bind(&item.created_at)
            .bind(&item.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_location.into_location(self.shop_id.clone()))
    }

    pub async fn update(&self, item: &Location) -> Result<Location> {
        let sql = r#"
            UPDATE locations SET
                name = $2,
                type = $3,
                is_sellable = $4,
                address_data = $5,
                _status = 'modified',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;

        let shop_location = sqlx::query_as::<_, ShopLocation>(sql)
            .bind(&item.id)
            .bind(&item.name)
            .bind(&item.type_)
            .bind(item.is_sellable)
            .bind(&item.address_data)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_location.into_location(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Location>> {
        let sql = "SELECT * FROM locations WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopLocation>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|l| l.into_location(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Location>> {
        let sql = "SELECT * FROM locations WHERE _status IS NULL OR _status != 'deleted' ORDER BY name ASC";
        let results = sqlx::query_as::<_, ShopLocation>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|l| l.into_location(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE locations SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn list_by_type(&self, location_type: &str) -> Result<Vec<Location>> {
        let sql = "SELECT * FROM locations WHERE type = $1 AND (_status IS NULL OR _status != 'deleted') ORDER BY name ASC";
        let results = sqlx::query_as::<_, ShopLocation>(sql)
            .bind(location_type)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|l| l.into_location(self.shop_id.clone()))
            .collect())
    }

    pub async fn list_sellable(&self) -> Result<Vec<Location>> {
        let sql = "SELECT * FROM locations WHERE is_sellable = 1 AND (_status IS NULL OR _status != 'deleted') ORDER BY name ASC";
        let results = sqlx::query_as::<_, ShopLocation>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|l| l.into_location(self.shop_id.clone()))
            .collect())
    }
}
