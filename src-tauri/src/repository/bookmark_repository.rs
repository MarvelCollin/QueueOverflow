use sea_orm::*;
use crate::entities::{bookmarks, users, questions, answers};
use crate::models::bookmark_models::{BookmarkResponse, BookmarkWithContentResponse, BookmarkContentSnapshot};
use crate::error::{Result, AppError};

pub struct BookmarkRepository {
    db: DatabaseConnection,
}

impl BookmarkRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_bookmark(
        &self,
        user_id: i32,
        target_id: i32,
        target_type: String,
        title: Option<String>,
        note: Option<String>,
    ) -> Result<BookmarkResponse> {
        let bookmark_title = match &title {
            Some(t) => t.clone(),
            None => format!("Bookmark for {} {}", target_type, target_id),
        };

        let bookmark = bookmarks::ActiveModel {
            user_id: Set(user_id),
            target_id: Set(target_id),
            target_type: Set(target_type),
            created_at: Set(chrono::Utc::now()),
            title: Set(bookmark_title),
            note: Set(note),
            ..Default::default()
        }.insert(&self.db).await?;

        Ok(BookmarkResponse {
            id: bookmark.id,
            user_id: bookmark.user_id,
            target_id: bookmark.target_id,
            target_type: bookmark.target_type,
            created_at: bookmark.created_at,
            title: bookmark.title,
            note: bookmark.note,
        })
    }

    pub async fn list_bookmarks(&self, user_id: i32) -> Result<Vec<BookmarkResponse>> {
        let bookmarks = bookmarks::Entity::find()
            .filter(bookmarks::Column::UserId.eq(user_id))
            .order_by_desc(bookmarks::Column::CreatedAt)
            .all(&self.db)
            .await?;

        let responses = bookmarks.into_iter()
            .map(|bookmark| BookmarkResponse {
                id: bookmark.id,
                user_id: bookmark.user_id,
                target_id: bookmark.target_id,
                target_type: bookmark.target_type,
                created_at: bookmark.created_at,
                title: bookmark.title,
                note: bookmark.note,
            })
            .collect();

        Ok(responses)
    }

    pub async fn get_bookmark(&self, id: i32, user_id: i32) -> Result<BookmarkWithContentResponse> {
        let bookmark = bookmarks::Entity::find_by_id(id)
            .filter(bookmarks::Column::UserId.eq(user_id))
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Bookmark not found".to_string()))?;

        let content_snapshot = self.get_content_snapshot(bookmark.target_id, &bookmark.target_type).await?;

        Ok(BookmarkWithContentResponse {
            id: bookmark.id,
            user_id: bookmark.user_id,
            target_id: bookmark.target_id,
            target_type: bookmark.target_type,
            created_at: bookmark.created_at,
            title: bookmark.title,
            note: bookmark.note,
            content_snapshot: Some(content_snapshot),
        })
    }

    pub async fn update_bookmark(
        &self,
        id: i32,
        user_id: i32,
        title: Option<String>,
        note: Option<String>,
    ) -> Result<BookmarkResponse> {
        let bookmark = bookmarks::Entity::find_by_id(id)
            .filter(bookmarks::Column::UserId.eq(user_id))
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Bookmark not found".to_string()))?;

        let mut bookmark_model: bookmarks::ActiveModel = bookmark.clone().into();

        if let Some(title) = title {
            bookmark_model.title = Set(title);
        }

        if let Some(note) = note {
            bookmark_model.note = Set(Some(note));
        } else {
            bookmark_model.note = Set(None);
        }

        let updated_bookmark = bookmark_model.update(&self.db).await?;

        Ok(BookmarkResponse {
            id: updated_bookmark.id,
            user_id: updated_bookmark.user_id,
            target_id: updated_bookmark.target_id,
            target_type: updated_bookmark.target_type,
            created_at: updated_bookmark.created_at,
            title: updated_bookmark.title,
            note: updated_bookmark.note,
        })
    }

    pub async fn delete_bookmark(&self, id: i32, user_id: i32) -> Result<()> {
        let result = bookmarks::Entity::delete_many()
            .filter(bookmarks::Column::Id.eq(id))
            .filter(bookmarks::Column::UserId.eq(user_id))
            .exec(&self.db)
            .await?;

        if result.rows_affected == 0 {
            return Err(AppError::NotFound("Bookmark not found".to_string()));
        }

        Ok(())
    }

    async fn get_content_title(&self, target_id: i32, target_type: &str) -> Result<String> {
        match target_type {
            "question" => {
                let question = questions::Entity::find_by_id(target_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Question not found".to_string()))?;
                Ok(question.title)
            },
            "answer" => {
                let answer = answers::Entity::find_by_id(target_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Answer not found".to_string()))?;

                let question = questions::Entity::find_by_id(answer.question_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Question not found".to_string()))?;

                Ok(format!("Answer to: {}", question.title))
            },
            _ => Err(AppError::Internal(format!("Unsupported target type: {}", target_type))),
        }
    }

    async fn get_content_snapshot(&self, target_id: i32, target_type: &str) -> Result<BookmarkContentSnapshot> {
        match target_type {
            "question" => {
                let question = questions::Entity::find_by_id(target_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Question not found".to_string()))?;

                let user = users::Entity::find_by_id(question.user_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

                Ok(BookmarkContentSnapshot {
                    title: question.title,
                    preview: Self::truncate_content(&question.content, 150),
                    author_name: user.display_name,
                    author_id: user.id,
                })
            },
            "answer" => {
                let answer = answers::Entity::find_by_id(target_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Answer not found".to_string()))?;

                let question = questions::Entity::find_by_id(answer.question_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Question not found".to_string()))?;

                let user = users::Entity::find_by_id(answer.user_id)
                    .one(&self.db)
                    .await?
                    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

                Ok(BookmarkContentSnapshot {
                    title: format!("Answer to: {}", question.title),
                    preview: Self::truncate_content(&answer.content, 150),
                    author_name: user.display_name,
                    author_id: user.id,
                })
            },
            _ => Err(AppError::Internal(format!("Unsupported target type: {}", target_type))),
        }
    }

    fn truncate_content(content: &str, max_length: usize) -> String {
        if content.len() <= max_length {
            return content.to_string();
        }

        let truncated = content.chars().take(max_length).collect::<String>();
        format!("{}...", truncated)
    }
}