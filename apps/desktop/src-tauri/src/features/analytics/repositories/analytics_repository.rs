use sqlx::SqlitePool;

#[derive(Debug, sqlx::FromRow)]
pub struct DashboardStatsRow {
    pub total_items: f64,
    pub low_stock_items: i64,
    pub total_inventory_value: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct StockMovementRow {
    pub bucket: String,
    pub stock_in: f64,
    pub stock_out: f64,
}

pub struct AnalyticsRepository {
    pool: SqlitePool,
}

impl AnalyticsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_dashboard_stats(&self, low_stock_threshold: f64) -> sqlx::Result<DashboardStatsRow> {
        let sql = r#"
            SELECT
                COALESCE(SUM(inventory_levels.quantity_on_hand), 0) AS total_items,
                COALESCE(SUM(CASE WHEN inventory_levels.quantity_on_hand <= $1 THEN 1 ELSE 0 END), 0) AS low_stock_items,
                COALESCE(SUM(inventory_levels.quantity_on_hand * COALESCE(products.cost_price, products.price, 0)), 0) AS total_inventory_value
            FROM inventory_levels
            LEFT JOIN products ON products.id = inventory_levels.product_id
            WHERE inventory_levels._status != 'deleted'
        "#;

        sqlx::query_as::<_, DashboardStatsRow>(sql)
            .bind(low_stock_threshold)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_stock_movements(
        &self,
        bucket_format: &str,
        start_at: Option<String>,
    ) -> sqlx::Result<Vec<StockMovementRow>> {
        let bucket_expr = format!("strftime('{}', created_at)", bucket_format);

        let sql = if start_at.is_some() {
            format!(
                r#"
                SELECT
                    {bucket_expr} AS bucket,
                    COALESCE(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END), 0) AS stock_in,
                    COALESCE(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END), 0) AS stock_out
                FROM inventory_movements
                WHERE _status != 'deleted' AND created_at >= $1
                GROUP BY bucket
                ORDER BY bucket ASC
                "#
            )
        } else {
            format!(
                r#"
                SELECT
                    {bucket_expr} AS bucket,
                    COALESCE(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END), 0) AS stock_in,
                    COALESCE(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END), 0) AS stock_out
                FROM inventory_movements
                WHERE _status != 'deleted'
                GROUP BY bucket
                ORDER BY bucket ASC
                "#
            )
        };

        let mut query = sqlx::query_as::<_, StockMovementRow>(&sql);
        if let Some(start_at) = start_at {
            query = query.bind(start_at);
        }

        query.fetch_all(&self.pool).await
    }
}
