use sqlx::{SqlitePool, Result};
use crate::models::user_identity::UserIdentity;

pub struct UserIdentityRepository {
    pool: SqlitePool,
}

impl UserIdentityRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: UserIdentity) -> Result<UserIdentity> {
        // RULE: Separate SQL for readability (> 3 parameters)
        let sql = r#"
            INSERT INTO user_identities (
                id, user_id, provider, provider_user_id, access_token,
                refresh_token, expires_at, profile_data, _status,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) -- RULE: Numbered params
            RETURNING * -- RULE: Return DB truth
        "#;

        sqlx::query_as::<_, UserIdentity>(sql) // RULE: Strict typing
            .bind(item.id)               // $1
            .bind(item.user_id)          // $2
            .bind(item.provider)         // $3
            .bind(item.provider_user_id) // $4
            .bind(item.access_token)     // $5
            .bind(item.refresh_token)    // $6
            .bind(item.expires_at)       // $7
            .bind(item.profile_data)     // $8
            .bind(item.status_internal)  // $9
            .bind(item.created_at)       // $10
            .bind(item.updated_at)       // $11
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: UserIdentity) -> Result<UserIdentity> {
        let sql = r#"
            UPDATE user_identities SET
                user_id = $2,
                provider = $3,
                provider_user_id = $4,
                access_token = $5,
                refresh_token = $6,
                expires_at = $7,
                profile_data = $8,
                _status = $9,
                updated_at = $10
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(item.id)               // $1 (Matches WHERE clause)
            .bind(item.user_id)          // $2
            .bind(item.provider)         // $3
            .bind(item.provider_user_id) // $4
            .bind(item.access_token)     // $5
            .bind(item.refresh_token)    // $6
            .bind(item.expires_at)       // $7
            .bind(item.profile_data)     // $8
            .bind(item.status_internal)  // $9
            .bind(item.updated_at)       // $10
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<UserIdentity>> {
        let sql = "SELECT * FROM user_identities WHERE id = $1";
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_by_provider(&self, provider: &str, provider_user_id: &str) -> Result<Option<UserIdentity>> {
        let sql = "SELECT * FROM user_identities WHERE provider = $1 AND provider_user_id = $2";
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(provider)
            .bind(provider_user_id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_by_user_id(&self, user_id: &str) -> Result<Vec<UserIdentity>> {
        let sql = "SELECT * FROM user_identities WHERE user_id = $1";
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM user_identities WHERE id = $1";
        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
