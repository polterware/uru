use serde_json::{json, Value};
use tauri::webview::Color;
use tauri::WebviewWindowBuilder;
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

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
        .invoke_handler(tauri::generate_handler![supabase_sign_in_with_password])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
