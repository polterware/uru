//! Shop-scoped Payment Service for Multi-Database Architecture

use crate::features::payment::models::payment_model::Payment;
use crate::features::payment::repositories::shop_payment_repository::ShopPaymentRepository;
use crate::features::refund::models::refund_model::Refund;
use crate::features::refund::repositories::shop_refund_repository::ShopRefundRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use std::sync::Arc;
use uuid::Uuid;

pub struct ShopPaymentService {
    pool: Arc<SqlitePool>,
    repo: ShopPaymentRepository,
}

impl ShopPaymentService {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        let repo = ShopPaymentRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub fn pool(&self) -> Arc<SqlitePool> {
        self.pool.clone()
    }

    pub async fn list_payments(&self) -> Result<Vec<Payment>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list payments: {}", e))
    }

    pub async fn get_payment(&self, id: &str) -> Result<Option<Payment>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get payment: {}", e))
    }

    pub async fn update_payment_status(&self, id: &str, status: &str) -> Result<Payment, String> {
        let payment = self
            .repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to get payment: {}", e))?
            .ok_or_else(|| format!("Payment not found: {}", id))?;

        let mut updated = payment.clone();
        updated.status = status.to_string();
        updated.updated_at = Some(Utc::now());

        self.repo
            .update(&updated)
            .await
            .map_err(|e| format!("Failed to update payment status: {}", e))
    }

    pub async fn capture_payment(&self, payment_id: &str) -> Result<Payment, String> {
        let payment = self
            .repo
            .get_by_id(payment_id)
            .await
            .map_err(|e| format!("Failed to get payment: {}", e))?
            .ok_or_else(|| format!("Payment not found: {}", payment_id))?;

        if payment.status == "captured" {
            return Err("Payment already captured".to_string());
        }

        if payment.status == "voided" {
            return Err("Payment was voided and cannot be captured".to_string());
        }

        self.repo
            .capture(payment_id)
            .await
            .map_err(|e| format!("Failed to capture payment: {}", e))
    }

    pub async fn void_payment(&self, payment_id: &str) -> Result<Payment, String> {
        let payment = self
            .repo
            .get_by_id(payment_id)
            .await
            .map_err(|e| format!("Failed to get payment: {}", e))?
            .ok_or_else(|| format!("Payment not found: {}", payment_id))?;

        if payment.status == "voided" {
            return Err("Payment already voided".to_string());
        }

        if payment.status == "captured" {
            return Err("Payment already captured. Use refund instead.".to_string());
        }

        self.repo
            .void(payment_id)
            .await
            .map_err(|e| format!("Failed to void payment: {}", e))
    }

    pub async fn process_refund(
        &self,
        payment_id: &str,
        amount: f64,
        reason: Option<&str>,
        created_by: Option<&str>,
    ) -> Result<Refund, String> {
        if amount <= 0.0 {
            return Err("Refund amount must be greater than zero".to_string());
        }

        let payment = self
            .repo
            .get_by_id(payment_id)
            .await
            .map_err(|e| format!("Failed to get payment: {}", e))?
            .ok_or_else(|| format!("Payment not found: {}", payment_id))?;

        if payment.status != "captured" && payment.status != "partially_refunded" {
            return Err(format!(
                "Payment with status '{}' cannot be refunded",
                payment.status
            ));
        }

        let already_refunded = self
            .repo
            .get_refunded_amount(payment_id)
            .await
            .map_err(|e| format!("Failed to get refunded amount: {}", e))?;

        let available_for_refund = payment.amount - already_refunded;

        if amount > available_for_refund {
            return Err(format!(
                "Refund amount ({}) exceeds available amount ({})",
                amount, available_for_refund
            ));
        }

        // Create refund record
        let now = Some(Utc::now());
        let refund = Refund {
            id: Uuid::new_v4().to_string(),
            payment_id: payment_id.to_string(),
            amount,
            status: "completed".to_string(),
            reason: reason.map(|s| s.to_string()),
            provider_refund_id: None,
            sync_status: Some("created".to_string()),
            created_at: now,
            updated_at: now,
            created_by: created_by.map(|s| s.to_string()),
        };

        let refund_repo = ShopRefundRepository::new(self.pool.clone());
        let created_refund = refund_repo
            .create(&refund)
            .await
            .map_err(|e| format!("Failed to create refund: {}", e))?;

        // Update payment status
        let total_refunded = already_refunded + amount;
        let new_status = if (payment.amount - total_refunded).abs() < 0.01 {
            "refunded"
        } else {
            "partially_refunded"
        };

        self.repo
            .update_status(payment_id, new_status)
            .await
            .map_err(|e| format!("Failed to update payment status: {}", e))?;

        Ok(created_refund)
    }

    pub async fn get_refunded_amount(&self, payment_id: &str) -> Result<f64, String> {
        self.repo
            .get_refunded_amount(payment_id)
            .await
            .map_err(|e| format!("Failed to get refunded amount: {}", e))
    }
}
