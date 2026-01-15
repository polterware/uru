use crate::dtos::user::CreateUserDTO;
use crate::models::user::User;
use crate::repositories::user::UserRepository;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_user(
    pool: State<'_, SqlitePool>,
    payload: CreateUserDTO,
) -> Result<User, String> {
    let (user, roles) = payload.into_models();
    let repo = UserRepository::new(pool.inner().clone());

    repo.create(user, Vec::new(), roles)
        .await
        .map_err(|e| format!("Erro ao criar usuário: {}", e))
}

#[tauri::command]
pub async fn delete_user(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = UserRepository::new(pool.inner().clone());

    repo.delete(&id)
        .await
        .map_err(|e| format!("Erro ao deletar usuário: {}", e))
}

#[tauri::command]
pub async fn get_user(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<User>, String> {
    let repo = UserRepository::new(pool.inner().clone());

    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Erro ao buscar usuário: {}", e))
}

#[tauri::command]
pub async fn list_users(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<User>, String> {
    let repo = UserRepository::new(pool.inner().clone());

    repo.list()
        .await
        .map_err(|e| format!("Erro ao listar usuários: {}", e))
}
