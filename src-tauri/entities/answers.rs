use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "answers")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub question_id: i32,
    pub user_id: i32,
    #[sea_orm(column_type = "Text")]
    pub content: String,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
    pub is_accepted: i8,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::questions::Entity",
        from = "Column::QuestionId",
        to = "super::questions::Column::Id",
        on_update = "Restrict",
        on_delete = "Cascade"
    )]
    Questions,
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id",
        on_update = "Restrict",
        on_delete = "Cascade"
    )]
    Users,
}

impl Related<super::questions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Questions.def()
    }
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Users.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
