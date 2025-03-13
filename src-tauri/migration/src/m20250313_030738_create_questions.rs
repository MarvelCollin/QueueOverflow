use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Questions::Table)
                    .if_not_exists()
                    .col(pk_auto(Questions::Id))
                    .col(string(Questions::Title).not_null())
                    .col(text(Questions::Content).not_null())
                    .col(integer(Questions::UserId).not_null())
                    .col(
                        timestamp_with_time_zone(Questions::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        timestamp_with_time_zone(Questions::UpdatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(Questions::ViewCount).default(0))
                    .col(boolean(Questions::IsClosed).default(false))
                    .col(boolean(Questions::IsAnswered).default(false))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_questions_users")
                            .from(Questions::Table, Questions::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Questions::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Questions {
    Table,
    Id,
    Title,
    Content,
    UserId,
    CreatedAt,
    UpdatedAt,
    ViewCount,
    IsClosed,
    IsAnswered,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
