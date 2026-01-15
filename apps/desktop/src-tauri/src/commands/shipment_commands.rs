use crate::dtos::shipment::CreateShipmentDTO;
use crate::models::shipment::Shipment;
use crate::repositories::shipments::ShipmentsRepository;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_shipment(
    pool: State<'_, SqlitePool>,
    payload: CreateShipmentDTO,
) -> Result<Shipment, String> {
    let (shipment, items) = payload.into_models();
    let repo = ShipmentsRepository::new(pool.inner().clone());

    repo.create(shipment, items, Vec::new())
        .await
        .map_err(|e| format!("Erro ao criar envio: {}", e))
}

#[tauri::command]
pub async fn delete_shipment(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = ShipmentsRepository::new(pool.inner().clone());

    repo.delete(&id)
        .await
        .map_err(|e| format!("Erro ao deletar envio: {}", e))
}

#[tauri::command]
pub async fn get_shipment(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Shipment>, String> {
    let repo = ShipmentsRepository::new(pool.inner().clone());

    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Erro ao buscar envio: {}", e))
}

#[tauri::command]
pub async fn list_shipments(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Shipment>, String> {
    let repo = ShipmentsRepository::new(pool.inner().clone());

    repo.list()
        .await
        .map_err(|e| format!("Erro ao listar envios: {}", e))
}
