//! Shop-scoped Checkout Repository for Multi-Database Architecture

use crate::features::checkout::models::checkout_model::Checkout;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, AnyPool};
use std::sync::Arc;

/// Internal struct for shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopCheckout {
    pub id: String,
    pub token: String,
    pub user_id: Option<String>,
    pub email: Option<String>,
    pub items: Option<String>,
    pub shipping_address: Option<String>,
    pub billing_address: Option<String>,
    pub shipping_line: Option<String>,
    pub applied_discount_codes: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_discounts: Option<f64>,
    pub total_price: Option<f64>,
    pub status: Option<String>,
    pub reservation_expires_at: Option<String>,
    pub completed_at: Option<String>,
    pub metadata: Option<String>,
    pub recovery_url: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl ShopCheckout {
    fn into_checkout(self, shop_id: String) -> Checkout {
        Checkout {
            id: self.id,
            shop_id: Some(shop_id),
            token: self.token,
            user_id: self.user_id,
            email: self.email,
            items: self.items,
            shipping_address: self.shipping_address,
            billing_address: self.billing_address,
            shipping_line: self.shipping_line,
            applied_discount_codes: self.applied_discount_codes,
            currency: self.currency,
            subtotal_price: self.subtotal_price,
            total_tax: self.total_tax,
            total_shipping: self.total_shipping,
            total_discounts: self.total_discounts,
            total_price: self.total_price,
            status: self.status,
            reservation_expires_at: self.reservation_expires_at,
            completed_at: self.completed_at,
            metadata: self.metadata,
            recovery_url: self.recovery_url,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

pub struct ShopCheckoutRepository {
    pool: Arc<AnyPool>,
    shop_id: String,
}

impl ShopCheckoutRepository {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, checkout: &Checkout) -> Result<Checkout> {
        let sql = r#"
            INSERT INTO checkouts (
                id, token, user_id, email, items, shipping_address, billing_address,
                shipping_line, applied_discount_codes, currency, subtotal_price,
                total_tax, total_shipping, total_discounts, total_price, status,
                reservation_expires_at, completed_at, metadata, recovery_url,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            RETURNING *
        "#;

        let shop_checkout = sqlx::query_as::<_, ShopCheckout>(sql)
            .bind(&checkout.id)
            .bind(&checkout.token)
            .bind(&checkout.user_id)
            .bind(&checkout.email)
            .bind(&checkout.items)
            .bind(&checkout.shipping_address)
            .bind(&checkout.billing_address)
            .bind(&checkout.shipping_line)
            .bind(&checkout.applied_discount_codes)
            .bind(&checkout.currency)
            .bind(&checkout.subtotal_price)
            .bind(&checkout.total_tax)
            .bind(&checkout.total_shipping)
            .bind(&checkout.total_discounts)
            .bind(&checkout.total_price)
            .bind(&checkout.status)
            .bind(&checkout.reservation_expires_at)
            .bind(&checkout.completed_at)
            .bind(&checkout.metadata)
            .bind(&checkout.recovery_url)
            .bind(&checkout.sync_status)
            .bind(&checkout.created_at)
            .bind(&checkout.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_checkout.into_checkout(self.shop_id.clone()))
    }

    pub async fn update(&self, checkout: &Checkout) -> Result<Checkout> {
        let sql = r#"
            UPDATE checkouts SET
                token = $2,
                user_id = $3,
                email = $4,
                items = $5,
                shipping_address = $6,
                billing_address = $7,
                shipping_line = $8,
                applied_discount_codes = $9,
                currency = $10,
                subtotal_price = $11,
                total_tax = $12,
                total_shipping = $13,
                total_discounts = $14,
                total_price = $15,
                status = $16,
                reservation_expires_at = $17,
                completed_at = $18,
                metadata = $19,
                recovery_url = $20,
                _status = $21,
                updated_at = $22
            WHERE id = $1
            RETURNING *
        "#;

        let shop_checkout = sqlx::query_as::<_, ShopCheckout>(sql)
            .bind(&checkout.id)
            .bind(&checkout.token)
            .bind(&checkout.user_id)
            .bind(&checkout.email)
            .bind(&checkout.items)
            .bind(&checkout.shipping_address)
            .bind(&checkout.billing_address)
            .bind(&checkout.shipping_line)
            .bind(&checkout.applied_discount_codes)
            .bind(&checkout.currency)
            .bind(&checkout.subtotal_price)
            .bind(&checkout.total_tax)
            .bind(&checkout.total_shipping)
            .bind(&checkout.total_discounts)
            .bind(&checkout.total_price)
            .bind(&checkout.status)
            .bind(&checkout.reservation_expires_at)
            .bind(&checkout.completed_at)
            .bind(&checkout.metadata)
            .bind(&checkout.recovery_url)
            .bind(&checkout.sync_status)
            .bind(&checkout.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_checkout.into_checkout(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Checkout>> {
        let sql = "SELECT * FROM checkouts WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCheckout>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_checkout(self.shop_id.clone())))
    }

    pub async fn get_by_token(&self, token: &str) -> Result<Option<Checkout>> {
        let sql = "SELECT * FROM checkouts WHERE token = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopCheckout>(sql)
            .bind(token)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|c| c.into_checkout(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Checkout>> {
        let sql = "SELECT * FROM checkouts WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopCheckout>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|c| c.into_checkout(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE checkouts SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Checkout> {
        let sql = r#"
            UPDATE checkouts
            SET status = $2,
                completed_at = CASE WHEN $2 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                _status = 'modified',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_checkout = sqlx::query_as::<_, ShopCheckout>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_checkout.into_checkout(self.shop_id.clone()))
    }
}
