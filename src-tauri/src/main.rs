#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection, DbErr, EntityTrait};
use sea_orm_migration::{prelude::*, SchemaManager};
use std::env;
use tauri::State;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to QueueOverflow!", name)
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let db = Database::connect(&db_url)
        .await
        .expect("Failed to connect to database");

    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
