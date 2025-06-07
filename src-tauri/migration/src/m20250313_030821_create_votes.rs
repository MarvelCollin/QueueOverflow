use crate::m20250313_030734_create_users::Users;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
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
                            .string()
                            .not_null()

                    )
                    .col(ColumnDef::new(Votes::TargetId).integer().not_null())
                    .col(
                        ColumnDef::new(Votes::TargetType)
                            .string()
                            .not_null()

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
    Table,
    #[sea_orm(iden = "up")]
    Up,
    #[sea_orm(iden = "down")]
    Down,
}

#[derive(DeriveIden)]
pub enum TargetType {
    Table,
    #[sea_orm(iden = "question")]
    Question,
    #[sea_orm(iden = "answer")]
    Answer,
}
