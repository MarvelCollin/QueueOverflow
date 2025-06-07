#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection};
use sea_orm_migration::prelude::*;
use std::{env, time::Duration};

mod models;
mod repository;
mod handlers;
mod error;

#[path = "../entities/mod.rs"]
pub mod entities;

use handlers::{
    user_handlers::*,
    question_handlers::*,
    answer_handlers::*,
    tag_handlers::*,
    vote_handlers::*,
    comment_handlers::*,
    bookmark_handlers::*,
};

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
}

fn main() {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to create Tokio runtime");

    runtime.block_on(async {
        env_logger::init();
        dotenv().ok();

        if env::var("DATABASE_URL").is_err() {
            if let Ok(_) = env::var("DOCKER_ENV") {
                let postgres_url = "postgres://queueoverflow:queueoverflow@postgres:5432/queueoverflow";
                env::set_var("DATABASE_URL", postgres_url);
                println!("Using Docker PostgreSQL via service name: {}", postgres_url);
            } else {
                let postgres_url = "postgres://queueoverflow:queueoverflow@localhost:2002/queueoverflow";
                env::set_var("DATABASE_URL", postgres_url);
                println!("Using Docker PostgreSQL via localhost: {}", postgres_url);
            }
        }

        let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        println!("Connecting to database: {}", db_url);

        let mut retries = 0;
        let max_retries = 5;
        let mut db = None;

        while retries < max_retries {
            match Database::connect(&db_url).await {
                Ok(conn) => {
                    println!("✅ Successfully connected to database");
                    db = Some(conn);
                    break;
                },
                Err(err) => {
                    retries += 1;
                    println!("❌ Failed to connect to database (attempt {}/{}): {}", retries, max_retries, err);
                    
                    if retries < max_retries {
                        println!("Retrying connection in 3 seconds...");
                        tokio::time::sleep(Duration::from_secs(3)).await;
                    } else {
                        panic!("Failed to connect to PostgreSQL after {} attempts: {}", max_retries, err);
                    }
                }
            }
        }

        let db = db.expect("Failed to establish database connection");
            
        if env::var("JWT_SECRET").is_err() {
            let default_secret = "kolin123".to_string();
            env::set_var("JWT_SECRET", &default_secret);
            println!("JWT_SECRET not set in environment. Using default value.");
        }

        println!("Running database migrations...");
        match migration::Migrator::up(&db, None).await {
            Ok(_) => {
                println!("✅ Database migrations completed successfully");
                match db.execute_unprepared("SELECT COUNT(*) FROM users").await {
                    Ok(_) => println!("✅ Verified users table exists"),
                    Err(e) => println!("❌ Failed to verify users table: {}", e),
                }
            },
            Err(e) => {
                println!("❌ Failed to run migrations: {}", e);
                panic!("Failed to run database migrations: {}", e);
            }
        }

        let state = AppState { db };

        tauri::Builder::default()
            .manage(state)
            .invoke_handler(tauri::generate_handler![
                register,
                login,
                get_current_user,
                get_user_profile,
                update_profile,
                change_password,

                create_question,
                get_question,
                list_questions,

                create_answer,
                get_question_answers,
                accept_answer,

                create_tag,
                get_tag,
                list_tags,
                search_tags,

                create_vote,
                get_vote_count,
                
                create_comment,
                get_comments,
                update_comment,
                delete_comment,
                
                create_bookmark,
                list_bookmarks,
                get_bookmark,
                update_bookmark,
                delete_bookmark,
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
