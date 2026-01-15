use crate::dtos::user_dto::CreateUserDTO;
use crate::models::user_model::User;
use crate::repositories::user_repository::UserRepository;
use sqlx::SqlitePool;

pub struct UserService {
    repo: UserRepository,
}

impl UserService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = UserRepository::new(pool);
        Self { repo }
    }

    pub async fn create_user(&self, payload: CreateUserDTO) -> Result<User, String> {
        let (user, roles) = payload.into_models();
        // Passing Vec::new() as the second argument (likely sessions) as per original command logic
        self.repo.create(user, Vec::new(), roles).await.map_err(|e| format!("Erro ao criar usuário: {}", e))
    }

    pub async fn delete_user(&self, id: &str) -> Result<(), String> {
        self.repo.delete(id).await.map_err(|e| format!("Erro ao deletar usuário: {}", e))
    }

    pub async fn get_user(&self, id: &str) -> Result<Option<User>, String> {
        self.repo.get_by_id(id).await.map_err(|e| format!("Erro ao buscar usuário: {}", e))
    }

    pub async fn list_users(&self) -> Result<Vec<User>, String> {
        self.repo.list().await.map_err(|e| format!("Erro ao listar usuários: {}", e))
    }
}
