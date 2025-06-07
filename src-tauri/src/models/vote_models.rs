use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct VoteResponse {
    pub id: i32,
    pub user_id: i32,
    pub vote_type: String,
    pub target_id: i32,
    pub target_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateVoteRequest {
    pub target_id: i32,
    pub target_type: String,
    pub vote_type: String,
}

#[derive(Debug, Serialize)]
pub struct VoteCount {
    pub upvotes: i64,
    pub downvotes: i64,
    pub total: i64,
}
