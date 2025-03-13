use sea_orm_migration::{prelude::*, schema::*};

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
                    .col(pk_auto(Answers::Id))
                    .col(integer(Answers::QuestionId).not_null())
                    .col(integer(Answers::UserId).not_null())
                    .col(text(Answers::Content).not_null())
                    .col(
                        timestamp_with_time_zone(Answers::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        timestamp_with_time_zone(Answers::UpdatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(boolean(Answers::IsAccepted).default(false))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_answers_questions")
                            .from(Answers::Table, Answers::QuestionId)
                            .to(Questions::Table, Questions::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_answers_users")
                            .from(Answers::Table, Answers::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
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
enum Answers {
    Table,
    Id,
    QuestionId,
    UserId,
    Content,
    CreatedAt,
    UpdatedAt,
    IsAccepted,
}

#[derive(DeriveIden)]
enum Questions {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
