use crate::dtos::inquiry_dto::CreateInquiryDTO;
use crate::models::inquiry_model::Inquiry;
use crate::repositories::inquiries_repository::InquiriesRepository;
use sqlx::SqlitePool;

pub struct InquiryService {
    repo: InquiriesRepository,
}

impl InquiryService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = InquiriesRepository::new(pool);
        Self { repo }
    }

    pub async fn create_inquiry(&self, payload: CreateInquiryDTO) -> Result<Inquiry, String> {
        let (inquiry, messages) = payload.into_models();
        self.repo.create(inquiry, messages).await.map_err(|e| format!("Erro ao criar inquiry: {}", e))
    }

    pub async fn delete_inquiry(&self, id: &str) -> Result<(), String> {
        self.repo.delete(id).await.map_err(|e| format!("Erro ao deletar inquiry: {}", e))
    }

    pub async fn get_inquiry(&self, id: &str) -> Result<Option<Inquiry>, String> {
        self.repo.get_by_id(id).await.map_err(|e| format!("Erro ao buscar inquiry: {}", e))
    }

    pub async fn list_inquiries(&self) -> Result<Vec<Inquiry>, String> {
        self.repo.list().await.map_err(|e| format!("Erro ao listar inquiries: {}", e))
    }
}
