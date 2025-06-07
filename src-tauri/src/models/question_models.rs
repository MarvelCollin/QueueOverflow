use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct QuestionResponse {
    pub id: i32,
    pub title: String,
    pub content: String,
    pub user_id: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub view_count: i32,
    pub is_closed: bool,
    pub is_answered: bool,
    pub tags: Vec<String>,
    pub author: UserBrief,
    pub answer_count: i32,
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
pub struct CreateQuestionRequest {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateQuestionRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct QuestionQuery {
    pub page: Option<u32>,
    pub per_page: Option<u32>,
    pub sort_by: Option<String>,
    pub tag: Option<String>,
    pub search: Option<String>,
} 