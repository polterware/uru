use crate::models::customer_group_membership::CustomerGroupMembership;
use sqlx::{Result, SqlitePool};

pub struct CustomerGroupMembershipsRepository {
    pool: SqlitePool,
}

impl CustomerGroupMembershipsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: CustomerGroupMembership) -> Result<CustomerGroupMembership> {
        let sql = r#"
            INSERT INTO customer_group_memberships (
                customer_id, customer_group_id, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING customer_id, customer_group_id, _status, created_at, updated_at
        "#;

        sqlx::query_as::<_, CustomerGroupMembership>(sql)
            .bind(item.customer_id)
            .bind(item.customer_group_id)
            .bind(item.status)
            .bind(item.created_at)
            .bind(item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, customer_id: String, customer_group_id: String) -> Result<()> {
        let sql = r#"
            DELETE FROM customer_group_memberships
            WHERE customer_id = $1 AND customer_group_id = $2
        "#;

        sqlx::query(sql)
            .bind(customer_id)
            .bind(customer_group_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn find_by_customer_id(&self, customer_id: String) -> Result<Vec<CustomerGroupMembership>> {
        let sql = r#"
            SELECT customer_id, customer_group_id, _status, created_at, updated_at
            FROM customer_group_memberships
            WHERE customer_id = $1
        "#;

        sqlx::query_as::<_, CustomerGroupMembership>(sql)
            .bind(customer_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn find_by_group_id(&self, group_id: String) -> Result<Vec<CustomerGroupMembership>> {
        let sql = r#"
            SELECT customer_id, customer_group_id, _status, created_at, updated_at
            FROM customer_group_memberships
            WHERE customer_group_id = $1
        "#;

        sqlx::query_as::<_, CustomerGroupMembership>(sql)
            .bind(group_id)
            .fetch_all(&self.pool)
            .await
    }
}
