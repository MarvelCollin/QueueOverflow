use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TagResponse {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub question_count: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct UpdateTagRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}
