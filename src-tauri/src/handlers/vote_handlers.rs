use tauri::State;
use crate::models::vote_models::*;
use crate::repository::vote_repository::VoteRepository;
use crate::AppState;

#[tauri::command]
pub async fn create_vote(
    state: State<'_, AppState>,
    user_id: i32,
    request: CreateVoteRequest,
) -> Result<VoteResponse, String> {
    let repo = VoteRepository::new(state.db.clone());
    
    match repo.create_vote(
        user_id,
        request.target_id,
        request.target_type,
        request.vote_type,
    ).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn get_vote_count(
    state: State<'_, AppState>,
    target_id: i32,
    target_type: String,
) -> Result<VoteCount, String> {
    let repo = VoteRepository::new(state.db.clone());
    
    match repo.get_vote_count(target_id, &target_type).await {
        Ok(count) => Ok(count),
        Err(e) => Err(e.to_string())
    }
}
