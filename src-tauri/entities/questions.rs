use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "questions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    #[sea_orm(column_type = "Text")]
    pub content: String,
    pub user_id: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
    pub view_count: i32,
    pub is_closed: i8,
    pub is_answered: i8,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::answers::Entity")]
    Answers,
    #[sea_orm(has_many = "super::question_tags::Entity")]
    QuestionTags,
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id",
        on_update = "Restrict",
        on_delete = "Cascade"
    )]
    Users,
}

impl Related<super::answers::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Answers.def()
    }
}

impl Related<super::question_tags::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::QuestionTags.def()
    }
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Users.def()
    }
}

impl Related<super::tags::Entity> for Entity {
    fn to() -> RelationDef {
        super::question_tags::Relation::Tags.def()
    }
    fn via() -> Option<RelationDef> {
        Some(super::question_tags::Relation::Questions.def().rev())
    }
}

impl ActiveModelBehavior for ActiveModel {}
