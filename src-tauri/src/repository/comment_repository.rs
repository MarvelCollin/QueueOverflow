use sea_orm::*;
use crate::entities::{users, comments};
use crate::models::comment_models::{CommentResponse, UserBrief};
use crate::error::{Result, AppError};

pub struct CommentRepository {
    db: DatabaseConnection,
}

impl CommentRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_comment(
        &self,
        user_id: i32,
        target_id: i32,
        target_type: String,
        content: String,
    ) -> Result<CommentResponse> {
        if content.trim().is_empty() {
            return Err(AppError::Internal("Comment content cannot be empty".to_string()));
        }

        let now = chrono::Utc::now();
        
        
        let comment_model = comments::ActiveModel {
            content: Set(content.clone()),
            user_id: Set(user_id),
            target_id: Set(target_id),
            target_type: Set(target_type.clone()),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };
        
        let comment = comment_model.insert(&self.db).await?;

        
        let user = users::Entity::find_by_id(user_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        
        let response = CommentResponse {
            id: comment.id,
            content: comment.content,
            user_id: comment.user_id,
            target_id: comment.target_id,
            target_type: comment.target_type,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            author: UserBrief {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                reputation: user.reputation,
                avatar_url: user.avatar_url,
            },
        };
        
        Ok(response)
    }

    pub async fn get_comments(
        &self,
        target_id: i32,
        target_type: &str,
    ) -> Result<Vec<CommentResponse>> {
        let comments = comments::Entity::find()
            .filter(
                Condition::all()
                    .add(comments::Column::TargetId.eq(target_id))
                    .add(comments::Column::TargetType.eq(target_type))
            )
            .order_by_desc(comments::Column::CreatedAt)
            .all(&self.db)
            .await?;

        let mut responses = Vec::new();
        for comment in comments {
            let user = users::Entity::find_by_id(comment.user_id)
                .one(&self.db)
                .await?
                .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

            responses.push(CommentResponse {
                id: comment.id,
                content: comment.content,
                user_id: comment.user_id,
                target_id: comment.target_id,
                target_type: comment.target_type,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                author: UserBrief {
                    id: user.id,
                    username: user.username,
                    display_name: user.display_name,
                    reputation: user.reputation,
                    avatar_url: user.avatar_url,
                },
            });
        }
        
        Ok(responses)
    }

    pub async fn update_comment(
        &self,
        id: i32,
        user_id: i32,
        content: String,
    ) -> Result<CommentResponse> {
        if content.trim().is_empty() {
            return Err(AppError::Internal("Comment content cannot be empty".to_string()));
        }

        let comment = comments::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Comment not found".to_string()))?;

        if comment.user_id != user_id {
            return Err(AppError::Internal("You can only update your own comments".to_string()));
        }

        let now = chrono::Utc::now();
        let comment = comments::ActiveModel {
            id: Set(id),
            content: Set(content),
            updated_at: Set(now),
            ..Default::default()
        }.update(&self.db).await?;

        let user = users::Entity::find_by_id(user_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        Ok(CommentResponse {
            id: comment.id,
            content: comment.content,
            user_id: comment.user_id,
            target_id: comment.target_id,
            target_type: comment.target_type,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            author: UserBrief {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                reputation: user.reputation,
                avatar_url: user.avatar_url,
            },
        })
    }

    pub async fn delete_comment(
        &self,
        id: i32,
        user_id: i32,
    ) -> Result<()> {
        let comment = comments::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Comment not found".to_string()))?;

        if comment.user_id != user_id {
            return Err(AppError::Internal("You can only delete your own comments".to_string()));
        }

        comments::Entity::delete_by_id(id)
            .exec(&self.db)
            .await?;

        Ok(())
    }
}