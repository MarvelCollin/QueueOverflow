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
                    .col(pk_auto(Votes::Id))
                    .col(integer(Votes::UserId).not_null())
                    .col(custom_type(
                        Votes::VoteType,
                        VoteType::Type.to_string(),
                        VoteType::Type.to_string(),
                    ))
                    .col(integer(Votes::TargetId).not_null())
                    .col(custom_type(
                        Votes::TargetType,
                        TargetType::Type.to_string(),
                        TargetType::Type.to_string(),
                    ))
                    .col(
                        timestamp_with_time_zone(Votes::CreatedAt)
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
enum Votes {
    Table,
    Id,
    UserId,
    VoteType,
    TargetId,
    TargetType,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum VoteType {
    #[sea_orm(iden = "vote_type")]
    Type,
    #[sea_orm(iden = "upvote")]
    Upvote,
    #[sea_orm(iden = "downvote")]
    Downvote,
}

#[derive(DeriveIden)]
enum TargetType {
    #[sea_orm(iden = "target_type")]
    Type,
    #[sea_orm(iden = "question")]
    Question,
    #[sea_orm(iden = "answer")]
    Answer,
}
