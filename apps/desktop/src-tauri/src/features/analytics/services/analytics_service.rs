use chrono::{DateTime, Duration, Utc};
use sqlx::SqlitePool;

use crate::features::analytics::dtos::analytics_dto::{
    DailyMovementStatDto, DashboardStatsDto, StockMovementsFilterDto,
};
use crate::features::analytics::repositories::analytics_repository::{
    AnalyticsRepository, DashboardStatsRow, StockMovementRow,
};

const LOW_STOCK_THRESHOLD: f64 = 5.0;

enum TimeBucket {
    Minute,
    Day,
}

impl TimeBucket {
    fn sqlite_format(&self) -> &'static str {
        match self {
            TimeBucket::Minute => "%Y-%m-%d %H:%M:00",
            TimeBucket::Day => "%Y-%m-%d",
        }
    }
}

struct ParsedTimeRange {
    start_at: Option<DateTime<Utc>>,
    bucket: TimeBucket,
}

pub struct AnalyticsService {
    repo: AnalyticsRepository,
}

impl AnalyticsService {
    pub fn new(pool: SqlitePool) -> Self {
        Self {
            repo: AnalyticsRepository::new(pool),
        }
    }

    pub async fn get_dashboard_stats(&self) -> Result<DashboardStatsDto, String> {
        let stats = self
            .repo
            .get_dashboard_stats(LOW_STOCK_THRESHOLD)
            .await
            .map_err(|e| format!("Failed to fetch dashboard stats: {}", e))?;

        Ok(Self::to_dashboard_stats(stats))
    }

    pub async fn get_stock_movements(
        &self,
        payload: StockMovementsFilterDto,
    ) -> Result<Vec<DailyMovementStatDto>, String> {
        let parsed = parse_time_range(&payload.time_range)?;
        let bucket_format = parsed.bucket.sqlite_format();
        let start_at = parsed.start_at.map(format_sqlite_datetime);

        let rows = self
            .repo
            .get_stock_movements(bucket_format, start_at)
            .await
            .map_err(|e| format!("Failed to fetch stock movements: {}", e))?;

        Ok(rows.into_iter().map(Self::to_movement_stat).collect())
    }

    fn to_dashboard_stats(stats: DashboardStatsRow) -> DashboardStatsDto {
        DashboardStatsDto {
            total_items: stats.total_items,
            low_stock_items: stats.low_stock_items,
            total_inventory_value: stats.total_inventory_value,
            total_items_growth: 0.0,
        }
    }

    fn to_movement_stat(row: StockMovementRow) -> DailyMovementStatDto {
        DailyMovementStatDto {
            date: row.bucket,
            stock_in: row.stock_in,
            stock_out: row.stock_out,
        }
    }
}

fn parse_time_range(value: &str) -> Result<ParsedTimeRange, String> {
    let now = Utc::now();
    let parsed = match value {
        "30m" => ParsedTimeRange {
            start_at: Some(now - Duration::minutes(30)),
            bucket: TimeBucket::Minute,
        },
        "1h" => ParsedTimeRange {
            start_at: Some(now - Duration::hours(1)),
            bucket: TimeBucket::Minute,
        },
        "2h" => ParsedTimeRange {
            start_at: Some(now - Duration::hours(2)),
            bucket: TimeBucket::Minute,
        },
        "7d" => ParsedTimeRange {
            start_at: Some(now - Duration::days(7)),
            bucket: TimeBucket::Day,
        },
        "30d" => ParsedTimeRange {
            start_at: Some(now - Duration::days(30)),
            bucket: TimeBucket::Day,
        },
        "90d" => ParsedTimeRange {
            start_at: Some(now - Duration::days(90)),
            bucket: TimeBucket::Day,
        },
        "1y" => ParsedTimeRange {
            start_at: Some(now - Duration::days(365)),
            bucket: TimeBucket::Day,
        },
        "all" => ParsedTimeRange {
            start_at: None,
            bucket: TimeBucket::Day,
        },
        _ => {
            return Err("Invalid time range value".to_string());
        }
    };

    Ok(parsed)
}

fn format_sqlite_datetime(value: DateTime<Utc>) -> String {
    value.format("%Y-%m-%d %H:%M:%S").to_string()
}
