use sqlx::{SqlitePool, Result};
use crate::models::user_role::UserRole;

pub struct UserRolesRepository {
    pool: SqlitePool,
}

impl UserRolesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: UserRole) -> Result<UserRole> {
        let sql = r#"
            INSERT INTO user_roles (user_id, role_id, _status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        "#;

        sqlx::query_as::<_, UserRole>(sql)
            .bind(item.user_id)         // $1
            .bind(item.role_id)         // $2
            .bind(item.status_internal) // $3
            .bind(item.created_at)      // $4
            .bind(item.updated_at)      // $5
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_by_composite_id(&self, user_id: &str, role_id: &str) -> Result<Option<UserRole>> {
        let sql = "SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2";
        sqlx::query_as::<_, UserRole>(sql)
            .bind(user_id)
            .bind(role_id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_by_user_id(&self, user_id: &str) -> Result<Vec<UserRole>> {
        let sql = "SELECT * FROM user_roles WHERE user_id = $1";
        sqlx::query_as::<_, UserRole>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_role_id(&self, role_id: &str) -> Result<Vec<UserRole>> {
        let sql = "SELECT * FROM user_roles WHERE role_id = $1";
        sqlx::query_as::<_, UserRole>(sql)
            .bind(role_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, user_id: &str, role_id: &str) -> Result<()> {
        let sql = "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2";
        sqlx::query(sql)
            .bind(user_id)
            .bind(role_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
