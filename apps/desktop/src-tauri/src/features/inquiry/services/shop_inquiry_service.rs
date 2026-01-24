//! Shop-scoped Inquiry Service for Multi-Database Architecture

use crate::features::inquiry::dtos::inquiry_dto::CreateInquiryDTO;
use crate::features::inquiry::models::inquiry_model::{Inquiry, InquiryMessage};
use crate::features::inquiry::repositories::shop_inquiry_message_repository::ShopInquiryMessageRepository;
use crate::features::inquiry::repositories::shop_inquiry_repository::ShopInquiryRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use std::sync::Arc;
use uuid::Uuid;

pub struct ShopInquiryService {
    pool: Arc<SqlitePool>,
    shop_id: String,
    repo: ShopInquiryRepository,
    messages_repo: ShopInquiryMessageRepository,
}

impl ShopInquiryService {
    pub fn new(pool: Arc<SqlitePool>, shop_id: String) -> Self {
        let repo = ShopInquiryRepository::new(pool.clone(), shop_id.clone());
        let messages_repo = ShopInquiryMessageRepository::new(pool.clone());
        Self {
            pool,
            shop_id,
            repo,
            messages_repo,
        }
    }

    pub fn shop_id(&self) -> &str {
        &self.shop_id
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn create_inquiry(&self, payload: CreateInquiryDTO) -> Result<Inquiry, String> {
        let (inquiry, messages) = payload.into_models();

        // Create inquiry
        let created_inquiry = self
            .repo
            .create(&inquiry)
            .await
            .map_err(|e| format!("Failed to create inquiry: {}", e))?;

        // Create messages if any
        if !messages.is_empty() {
            self.messages_repo
                .create_many(messages)
                .await
                .map_err(|e| format!("Failed to create messages: {}", e))?;
        }

        Ok(created_inquiry)
    }

    pub async fn add_message(
        &self,
        inquiry_id: &str,
        mut message: InquiryMessage,
    ) -> Result<InquiryMessage, String> {
        // Verify inquiry exists
        let _inquiry = self
            .repo
            .get_by_id(inquiry_id)
            .await
            .map_err(|e| format!("Failed to fetch inquiry: {}", e))?
            .ok_or_else(|| format!("Inquiry not found: {}", inquiry_id))?;

        // Set inquiry_id and generate ID if needed
        message.inquiry_id = inquiry_id.to_string();
        if message.id.is_empty() {
            message.id = Uuid::new_v4().to_string();
        }
        if message.created_at.is_none() {
            message.created_at = Some(Utc::now());
        }
        if message.updated_at.is_none() {
            message.updated_at = Some(Utc::now());
        }

        self.messages_repo
            .create(&message)
            .await
            .map_err(|e| format!("Failed to create message: {}", e))
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Inquiry, String> {
        self.repo
            .update_status(id, status)
            .await
            .map_err(|e| format!("Failed to update status: {}", e))
    }

    pub async fn resolve(&self, id: &str) -> Result<Inquiry, String> {
        // Verify inquiry exists
        let inquiry = self
            .repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch inquiry: {}", e))?
            .ok_or_else(|| format!("Inquiry not found: {}", id))?;

        if inquiry.status.as_deref() == Some("resolved") {
            return Err("Inquiry is already resolved".to_string());
        }

        self.repo
            .resolve(id)
            .await
            .map_err(|e| format!("Failed to resolve inquiry: {}", e))
    }

    pub async fn assign_to_staff(&self, id: &str, staff_id: &str) -> Result<Inquiry, String> {
        self.repo
            .assign_staff(id, staff_id)
            .await
            .map_err(|e| format!("Failed to assign staff: {}", e))
    }

    pub async fn delete_inquiry(&self, id: &str) -> Result<(), String> {
        // Delete messages first
        self.messages_repo
            .delete_by_inquiry_id(id)
            .await
            .map_err(|e| format!("Failed to delete messages: {}", e))?;

        // Delete inquiry (soft delete)
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete inquiry: {}", e))
    }

    pub async fn get_inquiry(&self, id: &str) -> Result<Option<Inquiry>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch inquiry: {}", e))
    }

    pub async fn list_inquiries(&self) -> Result<Vec<Inquiry>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list inquiries: {}", e))
    }

    pub async fn list_by_status(&self, status: &str) -> Result<Vec<Inquiry>, String> {
        self.repo
            .list_by_status(status)
            .await
            .map_err(|e| format!("Failed to list inquiries by status: {}", e))
    }

    pub async fn get_inquiry_messages(
        &self,
        inquiry_id: &str,
    ) -> Result<Vec<InquiryMessage>, String> {
        self.messages_repo
            .find_by_inquiry_id(inquiry_id)
            .await
            .map_err(|e| format!("Failed to fetch messages: {}", e))
    }
}
