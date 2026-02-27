use crate::db::RepositoryFactory;
use crate::features::shipment::dtos::shipment_dto::{CreateShipmentDTO, UpdateShipmentDTO};
use crate::features::shipment::models::shipment_model::Shipment;
use crate::features::shipment::services::shop_shipment_service::ShopShipmentService;
use chrono::Utc;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_shipment(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: CreateShipmentDTO,
) -> Result<Shipment, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let (shipment, _items) = payload.into_models();

    let service = ShopShipmentService::new(pool);
    service.create_shipment(&shipment).await
}

#[tauri::command]
pub async fn update_shipment(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
    payload: UpdateShipmentDTO,
) -> Result<Shipment, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopShipmentService::new(pool);
    let existing = service
        .get_shipment(&id)
        .await?
        .ok_or_else(|| format!("Shipment not found: {}", id))?;

    let updated = Shipment {
        id: existing.id,
        order_id: existing.order_id,
        location_id: payload.location_id.or(existing.location_id),
        status: payload.status.or(existing.status),
        carrier_company: payload.carrier_company.or(existing.carrier_company),
        carrier_service: payload.carrier_service.or(existing.carrier_service),
        tracking_number: payload.tracking_number.or(existing.tracking_number),
        tracking_url: payload.tracking_url.or(existing.tracking_url),
        weight_g: payload.weight_g.or(existing.weight_g),
        height_mm: payload.height_mm.or(existing.height_mm),
        width_mm: payload.width_mm.or(existing.width_mm),
        depth_mm: payload.depth_mm.or(existing.depth_mm),
        package_type: payload.package_type.or(existing.package_type),
        shipping_label_url: payload.shipping_label_url.or(existing.shipping_label_url),
        invoice_url: payload.invoice_url.or(existing.invoice_url),
        invoice_key: payload.invoice_key.or(existing.invoice_key),
        cost_amount: payload.cost_amount.or(existing.cost_amount),
        insurance_amount: payload.insurance_amount.or(existing.insurance_amount),
        estimated_delivery_at: payload.estimated_delivery_at.or(existing.estimated_delivery_at),
        shipped_at: payload.shipped_at.or(existing.shipped_at),
        delivered_at: payload.delivered_at.or(existing.delivered_at),
        metadata: payload.metadata.or(existing.metadata),
        customs_info: payload.customs_info.or(existing.customs_info),
        sync_status: Some("modified".to_string()),
        created_at: existing.created_at,
        updated_at: Some(Utc::now()),
    };

    service.update_shipment(&updated).await
}

#[tauri::command]
pub async fn delete_shipment(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopShipmentService::new(pool);
    service.delete_shipment(&id).await
}

#[tauri::command]
pub async fn get_shipment(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<Shipment>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopShipmentService::new(pool);
    service.get_shipment(&id).await
}

#[tauri::command]
pub async fn list_shipments(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Shipment>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopShipmentService::new(pool);
    service.list_shipments().await
}

#[tauri::command]
pub async fn list_shipments_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<Shipment>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopShipmentService::new(pool);
    service.list_shipments().await
}
