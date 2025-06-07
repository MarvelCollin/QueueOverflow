use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use std::env;
use tauri::{command, State};

use crate::AppState;
use crate::models::user_models::{
    AuthResponse, ErrorResponse, LoginRequest, RegisterRequest, UserResponse,
    UpdateProfileRequest, ChangePasswordRequest, UserProfileResponse, Badge,
};
use crate::repository::user_repository::UserRepository;
use crate::repository::question_repository::QuestionRepository;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    iat: usize,
}

#[command]
pub async fn register(
    state: State<'_, AppState>,
    request: RegisterRequest,
) -> Result<AuthResponse, String> {
    match UserRepository::register(&state.db, request).await {
        Ok(user) => {
            let user_response = UserRepository::model_to_response(user);
            match generate_token(user_response.id) {
                Ok(token) => Ok(AuthResponse {
                    user: user_response,
                    token,
                }),
                Err(e) => Err(e.message)
            }
        }
        Err(e) => Err(e),
    }
}

#[command]
pub async fn login(
    state: State<'_, AppState>,
    request: LoginRequest,
) -> Result<AuthResponse, String> {
    match UserRepository::login(&state.db, request).await {
        Ok(user) => {
            let user_response = UserRepository::model_to_response(user);
            match generate_token(user_response.id) {
                Ok(token) => Ok(AuthResponse {
                    user: user_response,
                    token,
                }),
                Err(e) => Err(e.message)
            }
        }
        Err(e) => Err(e),
    }
}

#[command]
pub async fn get_current_user(
    state: State<'_, AppState>,
    user_id: i32,
) -> Result<UserResponse, String> {
    match UserRepository::find_by_id(&state.db, user_id).await {
        Ok(Some(user)) => {
            let user_response = UserRepository::model_to_response(user);
            Ok(user_response)
        }
        Ok(None) => Err("User not found".to_string()),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

#[command]
pub async fn get_user_profile(
    state: State<'_, AppState>,
    profile_user_id: i32,
) -> Result<UserProfileResponse, String> {
    match UserRepository::find_by_id(&state.db, profile_user_id).await {
        Ok(Some(user)) => {
            let user_response = UserRepository::model_to_response(user);
            
            let question_repo = QuestionRepository::new(state.db.clone());
            match question_repo.list_questions(1, 1000, None, None, None).await {
                Ok(questions) => {
                    let filtered_questions = questions
                        .into_iter()
                        .filter(|q| q.user_id == profile_user_id)
                        .collect::<Vec<_>>();
                    
                    let answer_count = 0;
                    
                    let badges: Vec<Badge> = Vec::new();
                    
                    Ok(UserProfileResponse {
                        user: user_response,
                        question_count: filtered_questions.len() as i32,
                        answer_count,
                        badges,
                    })
                },
                Err(e) => Err(format!("Error retrieving questions: {}", e))
            }
        },
        Ok(None) => Err("User not found".to_string()),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

#[command]
pub async fn update_profile(
    state: State<'_, AppState>,
    user_id: i32,
    request: UpdateProfileRequest,
) -> Result<UserResponse, String> {
    match UserRepository::update_profile(&state.db, user_id, request).await {
        Ok(user) => {
            let user_response = UserRepository::model_to_response(user);
            Ok(user_response)
        }
        Err(e) => Err(e),
    }
}

#[command]
pub async fn change_password(
    state: State<'_, AppState>,
    user_id: i32,
    request: ChangePasswordRequest,
) -> Result<(), String> {
    match UserRepository::change_password(&state.db, user_id, request).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e),
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
