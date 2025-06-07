use tauri::State;
use crate::models::comment_models::*;
use crate::repository::comment_repository::CommentRepository;
use crate::AppState;

#[tauri::command]
pub async fn create_comment(
    state: State<'_, AppState>,
    user_id: i32,
    request: CreateCommentRequest,
) -> Result<CommentResponse, String> {
    if request.content.trim().is_empty() {
        return Err("Comment content cannot be empty.".into());
    }
    
    let repo = CommentRepository::new(state.db.clone());
    
    match repo.create_comment(
        user_id,
        request.target_id,
        request.target_type,
        request.content,
    ).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn get_comments(
    state: State<'_, AppState>,
    target_id: i32,
    target_type: String,
) -> Result<Vec<CommentResponse>, String> {
    let repo = CommentRepository::new(state.db.clone());
    
    match repo.get_comments(target_id, &target_type).await {
        Ok(responses) => Ok(responses),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn update_comment(
    state: State<'_, AppState>,
    comment_id: i32,
    user_id: i32,
    request: UpdateCommentRequest,
) -> Result<CommentResponse, String> {
    if request.content.trim().is_empty() {
        return Err("Comment content cannot be empty.".into());
    }
    
    let repo = CommentRepository::new(state.db.clone());
    
    match repo.update_comment(comment_id, user_id, request.content).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn delete_comment(
    state: State<'_, AppState>,
    comment_id: i32,
    user_id: i32,
) -> Result<(), String> {
    let repo = CommentRepository::new(state.db.clone());
    
    match repo.delete_comment(comment_id, user_id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string())
    }
} 