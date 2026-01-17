use sqlx::SqlitePool;
use tauri::State;

use crate::features::analytics::dtos::analytics_dto::{
    DailyMovementStatDto, DashboardStatsDto, StockMovementsFilterDto,
};
use crate::features::analytics::services::analytics_service::AnalyticsService;

#[tauri::command]
pub async fn get_dashboard_stats(
    pool: State<'_, SqlitePool>,
) -> Result<DashboardStatsDto, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_dashboard_stats().await
}

#[tauri::command]
pub async fn get_stock_movements(
    pool: State<'_, SqlitePool>,
    payload: StockMovementsFilterDto,
) -> Result<Vec<DailyMovementStatDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_movements(payload).await
}
