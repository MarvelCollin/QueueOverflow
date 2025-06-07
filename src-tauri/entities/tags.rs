use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::question_tags::Entity")]
    QuestionTags,
}

impl Related<super::question_tags::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::QuestionTags.def()
    }
}

impl Related<super::questions::Entity> for Entity {
    fn to() -> RelationDef {
        super::question_tags::Relation::Questions.def()
    }
    fn via() -> Option<RelationDef> {
        Some(super::question_tags::Relation::Tags.def().rev())
    }
}

impl ActiveModelBehavior for ActiveModel {}
