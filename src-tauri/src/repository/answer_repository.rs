use sea_orm::*;
use crate::entities::{answers, users, votes};
use crate::models::answer_models::{AnswerResponse, UserBrief};
use crate::error::{Result, AppError};

pub struct AnswerRepository {
    db: DatabaseConnection,
}

impl AnswerRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_answer(
        &self,
        question_id: i32,
        user_id: i32,
        content: String,
    ) -> Result<AnswerResponse> {
        let answer = answers::ActiveModel {
            question_id: Set(question_id),
            user_id: Set(user_id),
            content: Set(content),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
            is_accepted: Set(0),
            ..Default::default()
        }.insert(&self.db).await?;

        self.get_answer_by_id(answer.id).await
    }

    pub async fn get_answer_by_id(&self, id: i32) -> Result<AnswerResponse> {
        let answer = answers::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Answer not found".to_string()))?;

        self.transform_to_response(answer).await
    }

    pub async fn get_answers_by_question_id(&self, question_id: i32) -> Result<Vec<AnswerResponse>> {
        let answers = answers::Entity::find()
            .filter(answers::Column::QuestionId.eq(question_id))
            .order_by_desc(answers::Column::CreatedAt)
            .all(&self.db)
            .await?;

        let mut responses = Vec::new();
        for answer in answers {
            responses.push(self.transform_to_response(answer).await?);
        }
        Ok(responses)
    }

    async fn transform_to_response(&self, answer: answers::Model) -> Result<AnswerResponse> {
        let user = users::Entity::find_by_id(answer.user_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        let votes = votes::Entity::find()
            .filter(votes::Column::TargetId.eq(answer.id))
            .filter(votes::Column::TargetType.eq("answer"))
            .all(&self.db)
            .await?;

        let vote_count = votes.iter().fold(0, |acc, vote| {
            acc + if vote.vote_type == "up" { 1 } else { -1 }
        });

        Ok(AnswerResponse {
            id: answer.id,
            question_id: answer.question_id,
            content: answer.content,
            user_id: answer.user_id,
            created_at: answer.created_at,
            updated_at: answer.updated_at,
            is_accepted: answer.is_accepted != 0,
            author: UserBrief {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                reputation: user.reputation,
                avatar_url: user.avatar_url,
            },
            vote_count,
        })
    }

    pub async fn accept_answer(&self, answer_id: i32) -> Result<()> {
        use crate::entities::questions;
        
        let txn = self.db.begin().await?;
        
        let answer = answers::Entity::find_by_id(answer_id)
            .one(&txn)
            .await?
            .ok_or_else(|| AppError::NotFound("Answer not found".to_string()))?;
            
        let question = questions::Entity::find_by_id(answer.question_id)
            .one(&txn)
            .await?
            .ok_or_else(|| AppError::NotFound("Question not found".to_string()))?;
            
        
        answers::Entity::update_many()
            .filter(answers::Column::QuestionId.eq(answer.question_id))
            .filter(answers::Column::IsAccepted.eq(1))
            .set(answers::ActiveModel {
                is_accepted: Set(0),
                ..Default::default()
            })
            .exec(&txn)
            .await?;
            
        
        answers::ActiveModel {
            id: Set(answer.id),
            is_accepted: Set(1),
            ..Default::default()
        }
        .update(&txn)
        .await?;
        
        
        questions::ActiveModel {
            id: Set(question.id),
            is_answered: Set(1),
            ..Default::default()
        }
        .update(&txn)
        .await?;
        
        
        if question.user_id != answer.user_id {
            let answer_author = users::Entity::find_by_id(answer.user_id)
                .one(&txn)
                .await?
                .ok_or_else(|| AppError::NotFound("Answer author not found".to_string()))?;

            users::ActiveModel {
                id: Set(answer_author.id),
                reputation: Set(answer_author.reputation + 15),
                ..Default::default()
            }
            .update(&txn)
            .await?;
        }
        
        txn.commit().await?;
        
        Ok(())
    }
}
