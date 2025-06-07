use sea_orm_migration::prelude::*;
use crate::m20250313_030734_create_users::Users;
use crate::m20250313_030738_create_questions::Questions;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Answers::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Answers::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key()
                    )
                    .col(
                        ColumnDef::new(Answers::QuestionId)
                            .integer()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Answers::UserId)
                            .integer()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Answers::Content)
                            .text()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Answers::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp())
                    )
                    .col(
                        ColumnDef::new(Answers::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp())
                    )
                    .col(
                        ColumnDef::new(Answers::IsAccepted)
                            .boolean()
                            .not_null()
                            .default(false)
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_answers_questions")
                            .from(Answers::Table, Answers::QuestionId)
                            .to(Questions::Table, Questions::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_answers_users")
                            .from(Answers::Table, Answers::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Answers::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
pub enum Answers {
    Table,
    Id,
    QuestionId,
    UserId,
    Content,
    CreatedAt,
    UpdatedAt,
    IsAccepted,
}
