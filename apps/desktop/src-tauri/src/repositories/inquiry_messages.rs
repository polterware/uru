use crate::models::inquiry_message::InquiryMessage;
use sqlx::{SqlitePool, Result};

pub struct InquiryMessagesRepository {
    pool: SqlitePool,
}

impl InquiryMessagesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: InquiryMessage) -> Result<InquiryMessage> {
        // RULE: Separate SQL for readability
        let sql = r#"
            INSERT INTO inquiry_messages (
                id, inquiry_id, sender_type, sender_id, body,
                is_internal_note, attachments, external_id, read_at,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        "#;

        sqlx::query_as::<_, InquiryMessage>(sql)
            .bind(item.id)               // $1
            .bind(item.inquiry_id)       // $2
            .bind(item.sender_type)      // $3
            .bind(item.sender_id)        // $4
            .bind(item.body)             // $5
            .bind(item.is_internal_note) // $6
            .bind(item.attachments)      // $7
            .bind(item.external_id)      // $8
            .bind(item.read_at)          // $9
            .bind(item.sync_status)      // $10
            .bind(item.created_at)       // $11
            .bind(item.updated_at)       // $12
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: InquiryMessage) -> Result<InquiryMessage> {
        let sql = r#"
            UPDATE inquiry_messages SET
                inquiry_id = $2,
                sender_type = $3,
                sender_id = $4,
                body = $5,
                is_internal_note = $6,
                attachments = $7,
                external_id = $8,
                read_at = $9,
                _status = $10,
                updated_at = $11
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, InquiryMessage>(sql)
            .bind(item.id)               // $1
            .bind(item.inquiry_id)       // $2
            .bind(item.sender_type)      // $3
            .bind(item.sender_id)        // $4
            .bind(item.body)             // $5
            .bind(item.is_internal_note) // $6
            .bind(item.attachments)      // $7
            .bind(item.external_id)      // $8
            .bind(item.read_at)          // $9
            .bind(item.sync_status)      // $10
            .bind(item.updated_at)       // $11
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<InquiryMessage>> {
        let sql = "SELECT * FROM inquiry_messages WHERE id = $1";

        sqlx::query_as::<_, InquiryMessage>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_by_inquiry_id(&self, inquiry_id: &str) -> Result<Vec<InquiryMessage>> {
        let sql = "SELECT * FROM inquiry_messages WHERE inquiry_id = $1 ORDER BY created_at ASC";

        sqlx::query_as::<_, InquiryMessage>(sql)
            .bind(inquiry_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM inquiry_messages WHERE id = $1";

        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
