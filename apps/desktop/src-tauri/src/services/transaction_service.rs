use crate::dtos::transaction_dto::CreateTransactionDTO;
use crate::models::transaction_model::Transaction;
use crate::repositories::transactions_repository::TransactionsRepository;
use sqlx::SqlitePool;

pub struct TransactionService {
    repo: TransactionsRepository,
}

impl TransactionService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = TransactionsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_transaction(&self, payload: CreateTransactionDTO) -> Result<Transaction, String> {
        let _location_id = payload.location_id.clone().ok_or("Location ID is required".to_string())?;
        let (transaction, items) = payload.into_models();
        // TODO: Implement inventory movement generation based on location_id and items
        self.repo.create(transaction, items, Vec::new()).await.map_err(|e| format!("Erro ao criar transação: {}", e))
    }

    pub async fn delete_transaction(&self, id: &str) -> Result<(), String> {
        self.repo.delete(id).await.map_err(|e| format!("Erro ao deletar transação: {}", e))
    }

    pub async fn get_transaction(&self, id: &str) -> Result<Option<Transaction>, String> {
        self.repo.get_by_id(id).await.map_err(|e| format!("Erro ao buscar transação: {}", e))
    }

    pub async fn list_transactions(&self) -> Result<Vec<Transaction>, String> {
        self.repo.list().await.map_err(|e| format!("Erro ao listar transações: {}", e))
    }
}
