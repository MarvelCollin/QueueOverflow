use crate::m20250313_030734_create_users::Users;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_type(
                Type::create()
                    .as_enum(VoteType::Type)
                    .values([VoteType::Upvote, VoteType::Downvote])
                    .to_owned(),
            )
            .await?;

        manager
            .create_type(
                Type::create()
                    .as_enum(TargetType::Type)
                    .values([TargetType::Question, TargetType::Answer])
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(Votes::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Votes::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Votes::UserId).integer().not_null())
                    .col(
                        ColumnDef::new(Votes::VoteType)
                            .custom(VoteType::Type.to_string())
                            .not_null(),
                    )
                    .col(ColumnDef::new(Votes::TargetId).integer().not_null())
                    .col(
                        ColumnDef::new(Votes::TargetType)
                            .custom(TargetType::Type.to_string())
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Votes::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_votes_users")
                            .from(Votes::Table, Votes::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Votes::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(VoteType::Type).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(TargetType::Type).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
pub enum Votes {
    Table,
    Id,
    UserId,
    VoteType,
    TargetId,
    TargetType,
    CreatedAt,
}

#[derive(DeriveIden)]
pub enum VoteType {
    #[sea_orm(iden = "vote_type")]
    Type,
    #[sea_orm(iden = "upvote")]
    Upvote,
    #[sea_orm(iden = "downvote")]
    Downvote,
}

#[derive(DeriveIden)]
pub enum TargetType {
    #[sea_orm(iden = "target_type")]
    Type,
    #[sea_orm(iden = "question")]
    Question,
    #[sea_orm(iden = "answer")]
    Answer,
}
