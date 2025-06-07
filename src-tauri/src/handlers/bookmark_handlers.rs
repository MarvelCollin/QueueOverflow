use tauri::State;
use crate::models::bookmark_models::*;
use crate::repository::bookmark_repository::BookmarkRepository;
use crate::AppState;

#[tauri::command]
pub async fn create_bookmark(
    state: State<'_, AppState>,
    user_id: i32,
    request: CreateBookmarkRequest,
) -> Result<BookmarkResponse, String> {
    let repo = BookmarkRepository::new(state.db.clone());

    match repo.create_bookmark(
        user_id,
        request.target_id,
        request.target_type,
        request.title,
        request.note,
    ).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn list_bookmarks(
    state: State<'_, AppState>,
    user_id: i32,
) -> Result<Vec<BookmarkResponse>, String> {
    let repo = BookmarkRepository::new(state.db.clone());

    match repo.list_bookmarks(user_id).await {
        Ok(responses) => Ok(responses),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn get_bookmark(
    state: State<'_, AppState>,
    bookmark_id: i32,
    user_id: i32,
) -> Result<BookmarkWithContentResponse, String> {
    let repo = BookmarkRepository::new(state.db.clone());

    match repo.get_bookmark(bookmark_id, user_id).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn update_bookmark(
    state: State<'_, AppState>,
    bookmark_id: i32,
    user_id: i32,
    request: UpdateBookmarkRequest,
) -> Result<BookmarkResponse, String> {
    let repo = BookmarkRepository::new(state.db.clone());

    match repo.update_bookmark(bookmark_id, user_id, request.title, request.note).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn delete_bookmark(
    state: State<'_, AppState>,
    bookmark_id: i32,
    user_id: i32,
) -> Result<(), String> {
    let repo = BookmarkRepository::new(state.db.clone());

    match repo.delete_bookmark(bookmark_id, user_id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string())
    }
}