use crate::dtos::customer::CreateCustomerDTO;
use crate::models::customer::Customer;
use crate::repositories::customer::CustomerRepository;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_customer(
    pool: State<'_, SqlitePool>,
    payload: CreateCustomerDTO,
) -> Result<Customer, String> {
    let (customer, addresses, memberships) = payload.into_models();
    let repo = CustomerRepository::new(pool.inner().clone());

    repo.create(customer, addresses, memberships)
        .await
        .map_err(|e| format!("Erro ao criar cliente: {}", e))
}

#[tauri::command]
pub async fn update_customer(
    pool: State<'_, SqlitePool>,
    payload: crate::dtos::customer::UpdateCustomerDTO,
) -> Result<Customer, String> {
    let customer = payload.into_models();
    let repo = CustomerRepository::new(pool.inner().clone());

    repo.update(customer)
        .await
        .map_err(|e| format!("Erro ao atualizar cliente: {}", e))
}

#[tauri::command]
pub async fn delete_customer(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = CustomerRepository::new(pool.inner().clone());

    repo.delete(&id)
        .await
        .map_err(|e| format!("Erro ao deletar cliente: {}", e))
}

#[tauri::command]
pub async fn get_customer(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Customer>, String> {
    let repo = CustomerRepository::new(pool.inner().clone());

    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Erro ao buscar cliente: {}", e))
}

#[tauri::command]
pub async fn list_customers(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Customer>, String> {
    let repo = CustomerRepository::new(pool.inner().clone());

    repo.list()
        .await
        .map_err(|e| format!("Erro ao listar clientes: {}", e))
}
