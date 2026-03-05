use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use tauri::webview::Color;
use tauri::WebviewWindowBuilder;
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SupabaseBootstrapPayload {
    url: String,
    publishable_key: String,
    project_ref: Option<String>,
    updated_at: Option<String>,
    source: Option<String>,
}

#[tauri::command]
async fn supabase_sign_in_with_password(
    supabase_url: String,
    publishable_key: String,
    email: String,
    password: String,
) -> Result<Value, String> {
    let endpoint = format!(
        "{}/auth/v1/token?grant_type=password",
        supabase_url.trim_end_matches('/')
    );

    let response = reqwest::Client::new()
        .post(endpoint)
        .header("apikey", &publishable_key)
        .header("Authorization", format!("Bearer {publishable_key}"))
        .json(&json!({
          "email": email,
          "password": password
        }))
        .send()
        .await
        .map_err(|error| format!("native_auth_request_failed: {error}"))?;

    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|error| format!("native_auth_read_response_failed: {error}"))?;

    if !status.is_success() {
        return Err(format!("native_auth_http_{}: {}", status.as_u16(), body));
    }

    serde_json::from_str(&body).map_err(|error| format!("native_auth_invalid_json: {error}"))
}

fn get_supabase_bootstrap_payload_path() -> Result<PathBuf, String> {
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME")
            .map_err(|error| format!("missing_home_directory: {error}"))?;
        return Ok(
            PathBuf::from(home)
                .join("Library")
                .join("Application Support")
                .join("uru")
                .join("bootstrap")
                .join("supabase.json"),
        );
    }

    #[cfg(target_os = "windows")]
    {
        let app_data = std::env::var("APPDATA")
            .map_err(|error| format!("missing_appdata_directory: {error}"))?;
        return Ok(
            PathBuf::from(app_data)
                .join("uru")
                .join("bootstrap")
                .join("supabase.json"),
        );
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let home = std::env::var("HOME")
            .map_err(|error| format!("missing_home_directory: {error}"))?;
        Ok(
            PathBuf::from(home)
                .join(".config")
                .join("uru")
                .join("bootstrap")
                .join("supabase.json"),
        )
    }
}

#[tauri::command]
fn consume_supabase_bootstrap_payload() -> Result<Option<Value>, String> {
    let payload_path = get_supabase_bootstrap_payload_path()?;

    if !payload_path.exists() {
        return Ok(None);
    }

    let payload_contents = fs::read_to_string(&payload_path)
        .map_err(|error| format!("bootstrap_payload_read_failed: {error}"))?;

    let payload: SupabaseBootstrapPayload = serde_json::from_str(&payload_contents)
        .map_err(|error| format!("bootstrap_payload_invalid_json: {error}"))?;

    fs::remove_file(&payload_path)
        .map_err(|error| format!("bootstrap_payload_delete_failed: {error}"))?;

    serde_json::to_value(payload)
        .map(Some)
        .map_err(|error| format!("bootstrap_payload_serialize_failed: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.handle()
                .plugin(tauri_plugin_store::Builder::new().build())?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let window_config = app
                .config()
                .app
                .windows
                .first()
                .cloned()
                .ok_or_else(|| std::io::Error::new(std::io::ErrorKind::NotFound, "missing window config"))?;

            let win_builder =
                WebviewWindowBuilder::from_config(app.handle(), &window_config)?.background_color(Color(0, 0, 0, 0));

            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Overlay);

            let _window = win_builder.build()?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            supabase_sign_in_with_password,
            consume_supabase_bootstrap_payload
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
