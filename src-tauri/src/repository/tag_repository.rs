use sea_orm::*;
use crate::entities::{tags, question_tags};
use crate::models::tag_models::TagResponse;
use crate::error::{Result, AppError};

pub struct TagRepository {
    db: DatabaseConnection,
}

impl TagRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_tag(&self, name: String, description: Option<String>) -> Result<TagResponse> {
        let tag = tags::ActiveModel {
            name: Set(name),
            description: Set(description),
            ..Default::default()
        }.insert(&self.db).await?;

        self.get_tag_by_id(tag.id).await
    }

    pub async fn get_tag_by_id(&self, id: i32) -> Result<TagResponse> {
        let tag = tags::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Tag not found".to_string()))?;

        let question_count = question_tags::Entity::find()
            .filter(question_tags::Column::TagId.eq(tag.id))
            .count(&self.db)
            .await?;

        Ok(TagResponse {
            id: tag.id,
            name: tag.name,
            description: tag.description,
            question_count: question_count as i32,
        })
    }

    pub async fn list_tags(&self) -> Result<Vec<TagResponse>> {
        let tags = tags::Entity::find()
            .order_by_asc(tags::Column::Name)
            .all(&self.db)
            .await?;

        let mut responses = Vec::new();
        for tag in tags {
            let question_count = question_tags::Entity::find()
                .filter(question_tags::Column::TagId.eq(tag.id))
                .count(&self.db)
                .await?;

            responses.push(TagResponse {
                id: tag.id,
                name: tag.name,
                description: tag.description,
                question_count: question_count as i32,
            });
        }

        Ok(responses)
    }

    pub async fn search_tags(&self, query: &str) -> Result<Vec<TagResponse>> {
        let tags = tags::Entity::find()
            .filter(tags::Column::Name.contains(query))
            .order_by_asc(tags::Column::Name)
            .all(&self.db)
            .await?;

        let mut responses = Vec::new();
        for tag in tags {
            let question_count = question_tags::Entity::find()
                .filter(question_tags::Column::TagId.eq(tag.id))
                .count(&self.db)
                .await?;

            responses.push(TagResponse {
                id: tag.id,
                name: tag.name,
                description: tag.description,
                question_count: question_count as i32,
            });
        }

        Ok(responses)
    }
}
