use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct CommentResponse {
    pub id: i32,
    pub content: String,
    pub user_id: i32,
    pub target_id: i32,
    pub target_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub author: UserBrief,
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
pub struct CreateCommentRequest {
    pub content: String,
    pub target_id: i32,
    pub target_type: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCommentRequest {
    pub content: String,
} 