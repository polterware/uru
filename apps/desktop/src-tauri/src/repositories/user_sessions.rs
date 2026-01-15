use sqlx::{SqlitePool, Result};
use crate::models::user_session::UserSession;

pub struct UserSessionRepository {
    pool: SqlitePool,
}

impl UserSessionRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: UserSession) -> Result<UserSession> {
        let sql = r#"
            INSERT INTO user_sessions (
                id, user_id, user_agent, ip_address, device_type,
                location, token_hash, expires_at, revoked_at,
                _status, created_at, updated_at, last_active_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        "#;

        sqlx::query_as::<_, UserSession>(sql)
            .bind(item.id)              // $1
            .bind(item.user_id)         // $2
            .bind(item.user_agent)      // $3
            .bind(item.ip_address)      // $4
            .bind(item.device_type)     // $5
            .bind(item.location)        // $6
            .bind(item.token_hash)      // $7
            .bind(item.expires_at)      // $8
            .bind(item.revoked_at)      // $9
            .bind(item.status_internal) // $10
            .bind(item.created_at)      // $11
            .bind(item.updated_at)      // $12
            .bind(item.last_active_at)  // $13
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: UserSession) -> Result<UserSession> {
        let sql = r#"
            UPDATE user_sessions SET
                user_id = $2,
                user_agent = $3,
                ip_address = $4,
                device_type = $5,
                location = $6,
                token_hash = $7,
                expires_at = $8,
                revoked_at = $9,
                _status = $10,
                updated_at = $11,
                last_active_at = $12
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, UserSession>(sql)
            .bind(item.id)              // $1
            .bind(item.user_id)         // $2
            .bind(item.user_agent)      // $3
            .bind(item.ip_address)      // $4
            .bind(item.device_type)     // $5
            .bind(item.location)        // $6
            .bind(item.token_hash)      // $7
            .bind(item.expires_at)      // $8
            .bind(item.revoked_at)      // $9
            .bind(item.status_internal) // $10
            .bind(item.updated_at)      // $11
            .bind(item.last_active_at)  // $12
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<UserSession>> {
        let sql = "SELECT * FROM user_sessions WHERE id = $1";
        sqlx::query_as::<_, UserSession>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_by_user_id(&self, user_id: &str) -> Result<Vec<UserSession>> {
        let sql = "SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, UserSession>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM user_sessions WHERE id = $1";
        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn revoke(&self, id: &str, revoked_at: chrono::DateTime<chrono::Utc>) -> Result<UserSession> {
        let sql = r#"
            UPDATE user_sessions SET
                revoked_at = $2,
                _status = $3,
                updated_at = $2
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, UserSession>(sql)
            .bind(id)         // $1
            .bind(revoked_at) // $2
            .bind("revoked")  // $3
            .fetch_one(&self.pool)
            .await
    }
}
