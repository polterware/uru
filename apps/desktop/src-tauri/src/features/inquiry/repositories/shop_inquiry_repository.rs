//! Shop-scoped Inquiry Repository for Multi-Database Architecture

use crate::features::inquiry::models::inquiry_model::Inquiry;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Result, AnyPool};
use std::sync::Arc;

/// Internal struct for shop database (no shop_id column)
#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
struct ShopInquiry {
    pub id: String,
    pub protocol_number: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub source: Option<String>,
    pub customer_id: Option<String>,
    pub requester_data: String,
    pub department: Option<String>,
    pub assigned_staff_id: Option<String>,
    pub subject: Option<String>,
    pub related_order_id: Option<String>,
    pub related_product_id: Option<String>,
    pub metadata: Option<String>,
    pub sla_due_at: Option<String>,
    pub resolved_at: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl ShopInquiry {
    fn into_inquiry(self, shop_id: String) -> Inquiry {
        Inquiry {
            id: self.id,
            shop_id,
            protocol_number: self.protocol_number,
            r#type: self.r#type,
            status: self.status,
            priority: self.priority,
            source: self.source,
            customer_id: self.customer_id,
            requester_data: self.requester_data,
            department: self.department,
            assigned_staff_id: self.assigned_staff_id,
            subject: self.subject,
            related_order_id: self.related_order_id,
            related_product_id: self.related_product_id,
            metadata: self.metadata,
            sla_due_at: self.sla_due_at,
            resolved_at: self.resolved_at,
            sync_status: self.sync_status,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

pub struct ShopInquiryRepository {
    pool: Arc<AnyPool>,
    shop_id: String,
}

impl ShopInquiryRepository {
    pub fn new(pool: Arc<AnyPool>, shop_id: String) -> Self {
        Self { pool, shop_id }
    }

    pub async fn create(&self, inquiry: &Inquiry) -> Result<Inquiry> {
        let sql = r#"
            INSERT INTO inquiries (
                id, protocol_number, type, status, priority, source,
                customer_id, requester_data, department, assigned_staff_id,
                subject, related_order_id, related_product_id, metadata,
                sla_due_at, resolved_at, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *
        "#;

        let shop_inquiry = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(&inquiry.id)
            .bind(&inquiry.protocol_number)
            .bind(&inquiry.r#type)
            .bind(&inquiry.status)
            .bind(&inquiry.priority)
            .bind(&inquiry.source)
            .bind(&inquiry.customer_id)
            .bind(&inquiry.requester_data)
            .bind(&inquiry.department)
            .bind(&inquiry.assigned_staff_id)
            .bind(&inquiry.subject)
            .bind(&inquiry.related_order_id)
            .bind(&inquiry.related_product_id)
            .bind(&inquiry.metadata)
            .bind(&inquiry.sla_due_at)
            .bind(&inquiry.resolved_at)
            .bind(&inquiry.sync_status)
            .bind(&inquiry.created_at)
            .bind(&inquiry.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_inquiry.into_inquiry(self.shop_id.clone()))
    }

    pub async fn update(&self, inquiry: &Inquiry) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET
                protocol_number = $2,
                type = $3,
                status = $4,
                priority = $5,
                source = $6,
                customer_id = $7,
                requester_data = $8,
                department = $9,
                assigned_staff_id = $10,
                subject = $11,
                related_order_id = $12,
                related_product_id = $13,
                metadata = $14,
                sla_due_at = $15,
                resolved_at = $16,
                _status = $17,
                updated_at = $18
            WHERE id = $1
            RETURNING *
        "#;

        let shop_inquiry = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(&inquiry.id)
            .bind(&inquiry.protocol_number)
            .bind(&inquiry.r#type)
            .bind(&inquiry.status)
            .bind(&inquiry.priority)
            .bind(&inquiry.source)
            .bind(&inquiry.customer_id)
            .bind(&inquiry.requester_data)
            .bind(&inquiry.department)
            .bind(&inquiry.assigned_staff_id)
            .bind(&inquiry.subject)
            .bind(&inquiry.related_order_id)
            .bind(&inquiry.related_product_id)
            .bind(&inquiry.metadata)
            .bind(&inquiry.sla_due_at)
            .bind(&inquiry.resolved_at)
            .bind(&inquiry.sync_status)
            .bind(&inquiry.updated_at)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_inquiry.into_inquiry(self.shop_id.clone()))
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE id = $1 AND (_status IS NULL OR _status != 'deleted')";
        let result = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(result.map(|i| i.into_inquiry(self.shop_id.clone())))
    }

    pub async fn list(&self) -> Result<Vec<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE _status IS NULL OR _status != 'deleted' ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopInquiry>(sql)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|i| i.into_inquiry(self.shop_id.clone()))
            .collect())
    }

    pub async fn list_by_status(&self, status: &str) -> Result<Vec<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE status = $1 AND (_status IS NULL OR _status != 'deleted') ORDER BY created_at DESC";
        let results = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(status)
            .fetch_all(&*self.pool)
            .await?;

        Ok(results
            .into_iter()
            .map(|i| i.into_inquiry(self.shop_id.clone()))
            .collect())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "UPDATE inquiries SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&*self.pool).await?;
        Ok(())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET status = $2, _status = 'modified', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_inquiry = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_inquiry.into_inquiry(self.shop_id.clone()))
    }

    pub async fn resolve(&self, id: &str) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET
                status = 'resolved',
                resolved_at = CURRENT_TIMESTAMP,
                _status = 'modified',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_inquiry = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(id)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_inquiry.into_inquiry(self.shop_id.clone()))
    }

    pub async fn assign_staff(&self, id: &str, staff_id: &str) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET
                assigned_staff_id = $2,
                _status = 'modified',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        let shop_inquiry = sqlx::query_as::<_, ShopInquiry>(sql)
            .bind(id)
            .bind(staff_id)
            .fetch_one(&*self.pool)
            .await?;

        Ok(shop_inquiry.into_inquiry(self.shop_id.clone()))
    }
}
