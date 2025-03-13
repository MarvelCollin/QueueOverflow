#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection, DbErr};
use sea_orm_migration::{prelude::*, SchemaManager};
use std::env;
use tauri::State;

mod models;
mod repository;
mod handlers;

#[path = "../entities/mod.rs"]
pub mod entities;

use handlers::{get_current_user, login, register};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to QueueOverflow!", name)
}

#[tokio::main]
async fn main() {
    env_logger::init();
    
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let db = Database::connect(&db_url)
        .await
        .expect("Failed to connect to database");
        
    if env::var("JWT_SECRET").is_err() {
        println!("Warning: JWT_SECRET not set in environment. Using default value.");
    }

    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            greet,
            register,
            login,
            get_current_user
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
