use tauri::State;
use crate::models::tag_models::*;
use crate::repository::tag_repository::TagRepository;
use crate::AppState;

#[tauri::command]
pub async fn create_tag(
    state: State<'_, AppState>,
    request: CreateTagRequest,
) -> Result<TagResponse, String> {
    let repo = TagRepository::new(state.db.clone());
    
    match repo.create_tag(request.name, request.description).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn get_tag(
    state: State<'_, AppState>,
    id: i32,
) -> Result<TagResponse, String> {
    let repo = TagRepository::new(state.db.clone());
    
    match repo.get_tag_by_id(id).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn list_tags(
    state: State<'_, AppState>,
) -> Result<Vec<TagResponse>, String> {
    let repo = TagRepository::new(state.db.clone());
    
    match repo.list_tags().await {
        Ok(responses) => Ok(responses),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn search_tags(
    state: State<'_, AppState>,
    query: String,
) -> Result<Vec<TagResponse>, String> {
    let repo = TagRepository::new(state.db.clone());
    
    match repo.search_tags(&query).await {
        Ok(responses) => Ok(responses),
        Err(e) => Err(e.to_string())
    }
}
