use crate::dtos::transaction::CreateTransactionDTO;
use crate::models::transaction::Transaction;
use crate::repositories::transactions::TransactionsRepository;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_transaction(
    pool: State<'_, SqlitePool>,
    payload: CreateTransactionDTO,
) -> Result<Transaction, String> {
    let location_id = payload.location_id.clone().ok_or("Location ID is required")?;
    let (transaction, items) = payload.into_models();
    let repo = TransactionsRepository::new(pool.inner().clone());

    repo.create(transaction, items, location_id)
        .await
        .map_err(|e| format!("Erro ao criar transação: {}", e))
}

#[tauri::command]
pub async fn delete_transaction(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = TransactionsRepository::new(pool.inner().clone());

    repo.delete(&id)
        .await
        .map_err(|e| format!("Erro ao deletar transação: {}", e))
}

#[tauri::command]
pub async fn get_transaction(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Transaction>, String> {
    let repo = TransactionsRepository::new(pool.inner().clone());

    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Erro ao buscar transação: {}", e))
}

#[tauri::command]
pub async fn list_transactions(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Transaction>, String> {
    let repo = TransactionsRepository::new(pool.inner().clone());

    repo.list()
        .await
        .map_err(|e| format!("Erro ao listar transações: {}", e))
}
