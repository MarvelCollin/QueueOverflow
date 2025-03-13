use dotenv::dotenv;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    
    dotenv().ok();
    
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
