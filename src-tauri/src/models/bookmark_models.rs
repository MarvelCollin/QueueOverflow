use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct BookmarkResponse {
    pub id: i32,
    pub user_id: i32,
    pub target_id: i32,
    pub target_type: String,
    pub created_at: DateTime<Utc>,
    pub title: String,
    pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BookmarkWithContentResponse {
    pub id: i32,
    pub user_id: i32,
    pub target_id: i32,
    pub target_type: String,
    pub created_at: DateTime<Utc>,
    pub title: String,
    pub note: Option<String>,
    pub content_snapshot: Option<BookmarkContentSnapshot>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BookmarkContentSnapshot {
    pub title: String,
    pub preview: String,
    pub author_name: String,
    pub author_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookmarkRequest {
    pub target_id: i32,
    pub target_type: String,
    pub title: Option<String>,
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookmarkRequest {
    pub title: Option<String>,
    pub note: Option<String>,
} 