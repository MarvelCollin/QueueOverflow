use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use std::env;
use tauri::{command, State};

use crate::models::user_models::{
    AuthResponse, ErrorResponse, LoginRequest, RegisterRequest, UserResponse,
};
use crate::repository::user_repository::UserRepository;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    iat: usize,
}

#[command]
pub async fn register(
    db: State<'_, DatabaseConnection>,
    request: RegisterRequest,
) -> Result<AuthResponse, ErrorResponse> {
    match UserRepository::register(&db, request).await {
        Ok(user) => {
            let user_response = UserRepository::model_to_response(user);

            let token = generate_token(user_response.id)?;

            Ok(AuthResponse {
                user: user_response,
                token,
            })
        }
        Err(e) => Err(ErrorResponse { message: e }),
    }
}

#[command]
pub async fn login(
    db: State<'_, DatabaseConnection>,
    request: LoginRequest,
) -> Result<AuthResponse, ErrorResponse> {
    match UserRepository::login(&db, request).await {
        Ok(user) => {
            let user_response = UserRepository::model_to_response(user);

            let token = generate_token(user_response.id)?;

            Ok(AuthResponse {
                user: user_response,
                token,
            })
        }
        Err(e) => Err(ErrorResponse { message: e }),
    }
}

#[command]
pub async fn get_current_user(
    db: State<'_, DatabaseConnection>,
    user_id: i32,
) -> Result<UserResponse, ErrorResponse> {
    match UserRepository::find_by_id(&db, user_id).await {
        Ok(Some(user)) => {
            let user_response = UserRepository::model_to_response(user);
            Ok(user_response)
        }
        Ok(None) => Err(ErrorResponse {
            message: "User not found".to_string(),
        }),
        Err(e) => Err(ErrorResponse {
            message: format!("Database error: {}", e),
        }),
    }
}

fn generate_token(user_id: i32) -> Result<String, ErrorResponse> {
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "your-256-bit-secret".to_string());

    let now = Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + Duration::days(7)).timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp,
        iat,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_bytes()),
    )
    .map_err(|e| ErrorResponse {
        message: format!("Failed to generate token: {}", e),
    })
}
