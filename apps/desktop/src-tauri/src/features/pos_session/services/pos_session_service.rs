use crate::features::pos_session::dtos::pos_session_dto::{
    ClosePosSessionDTO, CreatePosSessionDTO, UpdatePosSessionDTO,
};
use crate::features::pos_session::models::pos_session_model::PosSession;
use crate::features::pos_session::repositories::pos_sessions_repository::PosSessionsRepository;
use sqlx::SqlitePool;

pub struct PosSessionService {
    repo: PosSessionsRepository,
}

impl PosSessionService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = PosSessionsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_pos_session(
        &self,
        payload: CreatePosSessionDTO,
    ) -> Result<PosSession, String> {
        // Check if operator already has an open session
        if let Some(_existing) = self
            .repo
            .find_open_by_operator(&payload.operator_id)
            .await
            .map_err(|e| format!("Failed to check existing sessions: {}", e))?
        {
            return Err("Operator already has an open session".to_string());
        }

        let mut session = payload.into_model();

        // Get next session number for this shop
        let next_number = self
            .repo
            .get_next_session_number(&session.shop_id)
            .await
            .map_err(|e| format!("Failed to get session number: {}", e))?;
        session.session_number = Some(next_number);

        self.repo
            .create(session)
            .await
            .map_err(|e| format!("Failed to create POS session: {}", e))
    }

    pub async fn update_pos_session(
        &self,
        payload: UpdatePosSessionDTO,
    ) -> Result<PosSession, String> {
        let existing = self
            .repo
            .find_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch session: {}", e))?
            .ok_or_else(|| "POS session not found".to_string())?;

        if existing.status.as_deref() == Some("closed") {
            return Err("Cannot update a closed session".to_string());
        }

        let updated = payload.apply_to_session(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update POS session: {}", e))
    }

    pub async fn close_pos_session(
        &self,
        payload: ClosePosSessionDTO,
    ) -> Result<PosSession, String> {
        let existing = self
            .repo
            .find_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch session: {}", e))?
            .ok_or_else(|| "POS session not found".to_string())?;

        if existing.status.as_deref() == Some("closed") {
            return Err("Session is already closed".to_string());
        }

        let closed = payload.apply_to_session(existing);
        self.repo
            .update(closed)
            .await
            .map_err(|e| format!("Failed to close POS session: {}", e))
    }

    pub async fn delete_pos_session(&self, id: &str) -> Result<(), String> {
        let existing = self
            .repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch session: {}", e))?
            .ok_or_else(|| "POS session not found".to_string())?;

        if existing.status.as_deref() == Some("open") {
            return Err("Cannot delete an open session. Close it first.".to_string());
        }

        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete POS session: {}", e))
    }

    pub async fn get_pos_session(&self, id: &str) -> Result<Option<PosSession>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch POS session: {}", e))
    }

    pub async fn list_pos_sessions(&self) -> Result<Vec<PosSession>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list POS sessions: {}", e))
    }

    pub async fn list_pos_sessions_by_shop(&self, shop_id: &str) -> Result<Vec<PosSession>, String> {
        self.repo
            .list_by_shop(shop_id)
            .await
            .map_err(|e| format!("Failed to list POS sessions by shop: {}", e))
    }

    pub async fn get_open_session_by_operator(
        &self,
        operator_id: &str,
    ) -> Result<Option<PosSession>, String> {
        self.repo
            .find_open_by_operator(operator_id)
            .await
            .map_err(|e| format!("Failed to find open session: {}", e))
    }
}
