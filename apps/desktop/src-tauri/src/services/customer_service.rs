use crate::dtos::customer_dto::{CreateCustomerDTO, UpdateCustomerDTO};
use crate::models::customer_model::Customer;
use crate::repositories::customer_repository::CustomerRepository;
use sqlx::SqlitePool;

pub struct CustomerService {
    repo: CustomerRepository,
}

impl CustomerService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CustomerRepository::new(pool);
        Self { repo }
    }

    pub async fn create_customer(&self, payload: CreateCustomerDTO) -> Result<Customer, String> {
        let (customer, addresses, memberships) = payload.into_models();
        self.repo.create(customer, addresses, memberships).await.map_err(|e| format!("Erro ao criar cliente: {}", e))
    }

    pub async fn update_customer(&self, payload: UpdateCustomerDTO) -> Result<Customer, String> {
        let customer = payload.into_models();
        self.repo.update(customer).await.map_err(|e| format!("Erro ao atualizar cliente: {}", e))
    }

    pub async fn delete_customer(&self, id: &str) -> Result<(), String> {
        self.repo.delete(id).await.map_err(|e| format!("Erro ao deletar cliente: {}", e))
    }

    pub async fn get_customer(&self, id: &str) -> Result<Option<Customer>, String> {
        self.repo.get_by_id(id).await.map_err(|e| format!("Erro ao buscar cliente: {}", e))
    }

    pub async fn list_customers(&self) -> Result<Vec<Customer>, String> {
        self.repo.list().await.map_err(|e| format!("Erro ao listar clientes: {}", e))
    }
}
