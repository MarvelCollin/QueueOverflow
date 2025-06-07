use tauri::State;
use crate::models::answer_models::*;
use crate::repository::answer_repository::AnswerRepository;
use crate::AppState;

#[tauri::command]
pub async fn create_answer(
    state: State<'_, AppState>,
    user_id: i32,
    request: CreateAnswerRequest,
) -> Result<AnswerResponse, String> {
    if request.content.trim().is_empty() {
        return Err("Answer content cannot be empty.".into());
    }

    let repo = AnswerRepository::new(state.db.clone());

    match repo.create_answer(
        request.question_id,
        user_id,
        request.content,
    ).await {
        Ok(response) => Ok(response),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn get_question_answers(
    state: State<'_, AppState>,
    question_id: i32,
) -> Result<Vec<AnswerResponse>, String> {
    let repo = AnswerRepository::new(state.db.clone());

    match repo.get_answers_by_question_id(question_id).await {
        Ok(responses) => Ok(responses),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn accept_answer(
    state: State<'_, AppState>,
    answer_id: i32,
) -> Result<(), String> {
    let repo = AnswerRepository::new(state.db.clone());

    match repo.accept_answer(answer_id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string())
    }
}