pub mod db;
pub mod audit_log;
pub mod brand;
pub mod category;
pub mod checkout;
pub mod customer;
pub mod customer_address;
pub mod customer_group;
pub mod customer_group_membership;
pub mod inquiry;
pub mod inventory;
pub mod location;
pub mod order;
pub mod payment;
pub mod product;
pub mod refund;
pub mod review;
pub mod role;
pub mod shipment;
pub mod shop;
pub mod transaction;
pub mod user;
pub mod user_identity;
pub mod user_role;
pub mod user_session;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![tauri_plugin_sql::Migration {
        version: 1,
        description: "create_initial_schema",
        sql: include_str!("../migrations/001_initial_schema.sql"),
        kind: tauri_plugin_sql::MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:inventy.db", migrations)
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
