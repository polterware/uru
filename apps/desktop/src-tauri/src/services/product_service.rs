use crate::dtos::product_dto::{CreateProductDTO, UpdateProductDTO};
use crate::models::product_model::Product;
use crate::repositories::product_repository::ProductRepository;
use sqlx::SqlitePool;

pub struct ProductService {
    repo: ProductRepository,
}

impl ProductService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ProductRepository::new(pool);
        Self { repo }
    }

    pub async fn create_product(&self, payload: CreateProductDTO) -> Result<Product, String> {
        let (product, categories) = payload.into_models();
        self.repo.create(product, categories).await.map_err(|e| format!("Erro ao criar produto: {}", e))
    }

    pub async fn update_product(&self, payload: UpdateProductDTO) -> Result<Product, String> {
        let (product, _) = payload.into_models();
        self.repo.update(product).await.map_err(|e| format!("Erro ao atualizar produto: {}", e))
    }

    pub async fn delete_product(&self, id: &str) -> Result<(), String> {
        self.repo.delete(id).await.map_err(|e| format!("Erro ao deletar produto: {}", e))
    }

    pub async fn get_product(&self, id: &str) -> Result<Option<Product>, String> {
        self.repo.get_by_id(id).await.map_err(|e| format!("Erro ao buscar produto: {}", e))
    }

    pub async fn list_products(&self) -> Result<Vec<Product>, String> {
        self.repo.list().await.map_err(|e| format!("Erro ao listar produtos: {}", e))
    }
}
