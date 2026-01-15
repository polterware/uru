use crate::dtos::shipment_dto::CreateShipmentDTO;
use crate::models::shipment_model::Shipment;
use crate::repositories::shipments_repository::ShipmentsRepository;
use sqlx::SqlitePool;

pub struct ShipmentService {
    repo: ShipmentsRepository,
}

impl ShipmentService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ShipmentsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_shipment(&self, payload: CreateShipmentDTO) -> Result<Shipment, String> {
        let (shipment, items) = payload.into_models();
        // Passing Vec::new() as the third argument (likely events) as per original command logic
        self.repo.create(shipment, items, Vec::new()).await.map_err(|e| format!("Erro ao criar envio: {}", e))
    }

    pub async fn delete_shipment(&self, id: &str) -> Result<(), String> {
        self.repo.delete(id).await.map_err(|e| format!("Erro ao deletar envio: {}", e))
    }

    pub async fn get_shipment(&self, id: &str) -> Result<Option<Shipment>, String> {
        self.repo.get_by_id(id).await.map_err(|e| format!("Erro ao buscar envio: {}", e))
    }

    pub async fn list_shipments(&self) -> Result<Vec<Shipment>, String> {
        self.repo.list().await.map_err(|e| format!("Erro ao listar envios: {}", e))
    }
}
