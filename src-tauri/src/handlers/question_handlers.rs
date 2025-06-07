use tauri::State;
use serde::Deserialize;
use crate::models::question_models::*;
use crate::repository::question_repository::QuestionRepository;
use crate::AppState;

#[tauri::command]
pub async fn create_question(
    state: State<'_, AppState>,
    user_id: i32,
    request: CreateQuestionRequest,
) -> Result<QuestionResponse, String> {
    if request.title.trim().is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    
    let repo = QuestionRepository::new(state.db.clone());
    
    match repo.create_question(
        user_id,
        request.title,
        request.content,
        request.tags,
    ).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn get_question(
    state: State<'_, AppState>,
    id: i32,
) -> Result<QuestionResponse, String> {
    let repo = QuestionRepository::new(state.db.clone());
    
    match repo.get_question_by_id(id).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn list_questions(
    state: State<'_, AppState>,
    query: QuestionQuery,
) -> Result<Vec<QuestionResponse>, String> {
    let repo = QuestionRepository::new(state.db.clone());
    
    match repo.list_questions(
        query.page.unwrap_or(1),
        query.per_page.unwrap_or(10),
        query.sort_by,
        query.tag,
        query.search,
    ).await {
        Ok(responses) => Ok(responses),
        Err(e) => Err(e.to_string())
    }
}

#[derive(Deserialize)]
pub struct CreateQuestionRequest {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
}
