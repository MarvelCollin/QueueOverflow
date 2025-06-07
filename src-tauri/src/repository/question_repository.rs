use crate::entities::{question_tags, questions, tags, users, votes};
use crate::error::{AppError, Result};
use crate::models::question_models::{QuestionResponse, UserBrief};
use sea_orm::*;

pub struct QuestionRepository {
    db: DatabaseConnection,
}

impl QuestionRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_question(
        &self,
        user_id: i32,
        title: String,
        content: String,
        tags: Vec<String>,
    ) -> Result<QuestionResponse> {
        let txn = self.db.begin().await?;

        let question = questions::ActiveModel {
            title: Set(title),
            content: Set(content),
            user_id: Set(user_id),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
            view_count: Set(0),
            is_closed: Set(0),
            is_answered: Set(0),
            ..Default::default()
        }
        .insert(&txn)
        .await?;

        for tag_name in tags {
            let tag = match tags::Entity::find()
                .filter(tags::Column::Name.eq(&tag_name))
                .one(&txn)
                .await?
            {
                Some(t) => t,
                None => {
                    tags::ActiveModel {
                        name: Set(tag_name),
                        ..Default::default()
                    }
                    .insert(&txn)
                    .await?
                }
            };

            question_tags::ActiveModel {
                question_id: Set(question.id),
                tag_id: Set(tag.id),
                ..Default::default()
            }
            .insert(&txn)
            .await?;
        }

        txn.commit().await?;
        self.get_question_by_id(question.id).await
    }

    pub async fn get_question_by_id(&self, id: i32) -> Result<QuestionResponse> {
        let question = questions::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Question not found".to_string()))?;

        let tags = question.find_related(tags::Entity).all(&self.db).await?;

        let tag_names = tags.into_iter().map(|tag| tag.name).collect();

        self.transform_to_response(question, tag_names).await
    }

    pub async fn list_questions(
        &self,
        page: u32,
        per_page: u32,
        sort_by: Option<String>,
        _tag: Option<String>,
        search: Option<String>,
    ) -> Result<Vec<QuestionResponse>> {
        let mut query = questions::Entity::find();

        if let Some(search_term) = search {
            query = query.filter(
                Condition::any()
                    .add(questions::Column::Title.contains(&search_term))
                    .add(questions::Column::Content.contains(&search_term)),
            );
        }

        if let Some(sort) = sort_by {
            match sort.as_str() {
                "newest" => query = query.order_by_desc(questions::Column::CreatedAt),
                "oldest" => query = query.order_by_asc(questions::Column::CreatedAt),
                "most_viewed" => query = query.order_by_desc(questions::Column::ViewCount),
                _ => query = query.order_by_desc(questions::Column::CreatedAt),
            }
        } else {
            query = query.order_by_desc(questions::Column::CreatedAt);
        }

        let offset = (page - 1) * per_page;
        query = query.offset(offset as u64).limit(per_page as u64);

        let questions = query.all(&self.db).await?;

        let mut responses = Vec::new();
        for question in questions {
            let tags = question.find_related(tags::Entity).all(&self.db).await?;

            let tag_names = tags.into_iter().map(|tag| tag.name).collect();

            responses.push(self.transform_to_response(question, tag_names).await?);
        }

        Ok(responses)
    }

    async fn transform_to_response(
        &self,
        question: questions::Model,
        tags: Vec<String>,
    ) -> Result<QuestionResponse> {
        let user = users::Entity::find_by_id(question.user_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        use crate::entities::answers;
        let answer_count = answers::Entity::find()
            .filter(answers::Column::QuestionId.eq(question.id))
            .count(&self.db)
            .await? as i32;

        let votes = votes::Entity::find()
            .filter(votes::Column::TargetId.eq(question.id))
            .filter(votes::Column::TargetType.eq("question"))
            .all(&self.db)
            .await?;

        let vote_count = votes.iter().fold(0, |acc, vote| {
            acc + if vote.vote_type == "up" { 1 } else { -1 }
        });

        Ok(QuestionResponse {
            id: question.id,
            title: question.title,
            content: question.content,
            user_id: question.user_id,
            created_at: question.created_at,
            updated_at: question.updated_at,
            view_count: question.view_count,
            is_closed: question.is_closed != 0,
            is_answered: question.is_answered != 0,
            tags,
            author: UserBrief {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                reputation: user.reputation,
                avatar_url: user.avatar_url,
            },
            answer_count,
            vote_count,
        })
    }
}
