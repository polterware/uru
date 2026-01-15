use crate::dtos::inquiry::CreateInquiryDTO;
use crate::models::inquiry::Inquiry;
use crate::repositories::inquiries::InquiriesRepository;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_inquiry(
    pool: State<'_, SqlitePool>,
    payload: CreateInquiryDTO,
) -> Result<Inquiry, String> {
    let (inquiry, messages) = payload.into_models();
    let repo = InquiriesRepository::new(pool.inner().clone());

    repo.create(inquiry, messages)
        .await
        .map_err(|e| format!("Erro ao criar inquiry: {}", e))
}

#[tauri::command]
pub async fn delete_inquiry(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = InquiriesRepository::new(pool.inner().clone());

    repo.delete(&id)
        .await
        .map_err(|e| format!("Erro ao deletar inquiry: {}", e))
}

#[tauri::command]
pub async fn get_inquiry(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Inquiry>, String> {
    let repo = InquiriesRepository::new(pool.inner().clone());

    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Erro ao buscar inquiry: {}", e))
}

#[tauri::command]
pub async fn list_inquiries(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Inquiry>, String> {
    let repo = InquiriesRepository::new(pool.inner().clone());

    repo.list()
        .await
        .map_err(|e| format!("Erro ao listar inquiries: {}", e))
}
