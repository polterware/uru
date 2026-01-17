use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStatsDto {
    pub total_items: f64,
    pub low_stock_items: i64,
    pub total_inventory_value: f64,
    pub total_items_growth: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyMovementStatDto {
    pub date: String,
    pub stock_in: f64,
    pub stock_out: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StockMovementsFilterDto {
    pub time_range: String,
}
