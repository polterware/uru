use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use crate::models::user::{User, UserRole};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserDTO {
    pub email: Option<String>,
    pub phone: Option<String>,
    pub password: Option<String>,
    pub profile_type: Option<String>,
    pub status: Option<String>,
    pub role_ids: Vec<String>,
}

impl CreateUserDTO {
    pub fn into_models(self) -> (User, Vec<UserRole>) {
        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let user = User {
            id: user_id.clone(),
            email: self.email,
            phone: self.phone,
            password_hash: self.password, // Ideally hashed before being passed here
            security_stamp: Some(Uuid::new_v4().to_string()),
            is_email_verified: Some(false),
            is_phone_verified: Some(false),
            failed_login_attempts: Some(0),
            lockout_end_at: None,
            mfa_enabled: Some(false),
            mfa_secret: None,
            mfa_backup_codes: None,
            last_login_at: None,
            last_login_ip: None,
            status_internal: "created".to_string(),
            created_at: now,
            updated_at: now,
            profile_type: self.profile_type,
            status: self.status.or(Some("active".to_string())),
        };

        let roles = self.role_ids
            .into_iter()
            .map(|rid| UserRole {
                user_id: user_id.clone(),
                role_id: rid,
                sync_status: "created".to_string(),
                created_at: now,
                updated_at: now,
            })
            .collect();

        (user, roles)
    }
}
