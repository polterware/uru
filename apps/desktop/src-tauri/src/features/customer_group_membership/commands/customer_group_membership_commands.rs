use crate::db::RepositoryFactory;
use crate::features::customer::models::customer_model::CustomerGroupMembership;
use crate::features::customer_group_membership::dtos::customer_group_membership_dto::AssignCustomerGroupsDTO;
use crate::features::customer_group_membership::services::shop_customer_group_membership_service::ShopCustomerGroupMembershipService;
use chrono::Utc;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn assign_customer_groups(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: AssignCustomerGroupsDTO,
) -> Result<Vec<CustomerGroupMembership>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupMembershipService::new(pool);

    // Delete existing memberships for this customer
    service.delete_by_customer(&payload.customer_id).await?;

    if payload.group_ids.is_empty() {
        return Ok(Vec::new());
    }

    // Create new memberships
    let now = Utc::now();
    let memberships: Vec<CustomerGroupMembership> = payload
        .group_ids
        .iter()
        .map(|group_id| CustomerGroupMembership {
            customer_id: payload.customer_id.clone(),
            customer_group_id: group_id.clone(),
            sync_status: "created".to_string(),
            created_at: now,
            updated_at: now,
        })
        .collect();

    service.create_many(memberships).await
}

#[tauri::command]
pub async fn list_customer_group_memberships_by_customer(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    customer_id: String,
) -> Result<Vec<CustomerGroupMembership>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupMembershipService::new(pool);
    service.list_by_customer(&customer_id).await
}

#[tauri::command]
pub async fn list_customer_group_memberships_by_group(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    group_id: String,
) -> Result<Vec<CustomerGroupMembership>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupMembershipService::new(pool);
    service.list_by_group(&group_id).await
}

#[tauri::command]
pub async fn delete_customer_group_membership(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    customer_id: String,
    group_id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerGroupMembershipService::new(pool);
    service.delete_membership(&customer_id, &group_id).await
}
