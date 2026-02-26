use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let updater = match handle.updater() {
                    Ok(u) => u,
                    Err(e) => {
                        println!("Failed to get updater: {:?}", e);
                        return;
                    }
                };

                match updater.check().await {
                    Ok(update) => {
                        if let Some(update) = update {
                            println!("Update available: {}", update.version);
                            match update
                                .download_and_install(
                                    |chunk, total| {
                                        println!("Downloaded {} bytes", chunk);
                                        if let Some(total) = total {
                                            println!("Progress: {}/{} bytes", chunk, total);
                                        }
                                    },
                                    || {
                                        println!("Download finished, installing...");
                                    },
                                )
                                .await
                            {
                                Ok(_) => println!("Update installed successfully"),
                                Err(e) => println!("Failed to install update: {:?}", e),
                            }
                        } else {
                            println!("No updates available");
                        }
                    }
                    Err(e) => println!("Update check failed: {:?}", e),
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
