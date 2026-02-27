use crate::db::RepositoryFactory;
use crate::features::customer::models::customer_model::CustomerAddress;
use crate::features::customer_address::dtos::customer_address_dto::{
    CreateCustomerAddressDTO, UpdateCustomerAddressDTO,
};
use crate::features::customer_address::services::shop_customer_address_service::ShopCustomerAddressService;
use chrono::Utc;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn create_customer_address(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: CreateCustomerAddressDTO,
) -> Result<CustomerAddress, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let now = Utc::now();
    let address = CustomerAddress {
        id: Uuid::new_v4().to_string(),
        customer_id: payload.customer_id,
        r#type: payload.r#type,
        is_default: payload.is_default,
        first_name: payload.first_name,
        last_name: payload.last_name,
        company: payload.company,
        address1: payload.address1,
        address2: payload.address2,
        city: payload.city,
        province_code: payload.province_code,
        country_code: payload.country_code,
        postal_code: payload.postal_code,
        phone: payload.phone,
        metadata: payload.metadata,
        sync_status: Some("created".to_string()),
        created_at: Some(now),
        updated_at: Some(now),
    };

    let service = ShopCustomerAddressService::new(pool);
    service.create_address(&address).await
}

#[tauri::command]
pub async fn update_customer_address(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateCustomerAddressDTO,
) -> Result<CustomerAddress, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerAddressService::new(pool);
    let existing = service
        .get_address(&payload.id)
        .await?
        .ok_or_else(|| format!("Customer address not found: {}", payload.id))?;

    let updated = CustomerAddress {
        id: existing.id,
        customer_id: existing.customer_id,
        r#type: payload.r#type.or(existing.r#type),
        is_default: payload.is_default.or(existing.is_default),
        first_name: payload.first_name.or(existing.first_name),
        last_name: payload.last_name.or(existing.last_name),
        company: payload.company.or(existing.company),
        address1: payload.address1.or(existing.address1),
        address2: payload.address2.or(existing.address2),
        city: payload.city.or(existing.city),
        province_code: payload.province_code.or(existing.province_code),
        country_code: payload.country_code.or(existing.country_code),
        postal_code: payload.postal_code.or(existing.postal_code),
        phone: payload.phone.or(existing.phone),
        metadata: payload.metadata.or(existing.metadata),
        sync_status: Some("modified".to_string()),
        created_at: existing.created_at,
        updated_at: Some(Utc::now()),
    };

    service.update_address(&updated).await
}

#[tauri::command]
pub async fn delete_customer_address(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerAddressService::new(pool);
    service.delete_address(&id).await
}

#[tauri::command]
pub async fn get_customer_address(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<CustomerAddress>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerAddressService::new(pool);
    service.get_address(&id).await
}

#[tauri::command]
pub async fn list_customer_addresses(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<CustomerAddress>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerAddressService::new(pool);
    service.list_addresses().await
}

#[tauri::command]
pub async fn list_customer_addresses_by_customer(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    customer_id: String,
) -> Result<Vec<CustomerAddress>, String> {
    let pool = repo_factory
        .shop_db(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;

    let service = ShopCustomerAddressService::new(pool);
    service.list_by_customer(&customer_id).await
}
