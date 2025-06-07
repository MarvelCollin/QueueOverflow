use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct AnswerResponse {
    pub id: i32,
    pub question_id: i32,
    pub content: String,
    pub user_id: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_accepted: bool,
    pub author: UserBrief,
    pub vote_count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserBrief {
    pub id: i32,
    pub username: String,
    pub display_name: String,
    pub reputation: i32,
    pub avatar_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAnswerRequest {
    pub question_id: i32,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAnswerRequest {
    pub content: String,
}
