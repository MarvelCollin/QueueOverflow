use sea_orm_migration::prelude::*;
use crate::m20250313_030734_create_users::Users;

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
                    .col(
                        ColumnDef::new(Questions::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key()
                    )
                    .col(
                        ColumnDef::new(Questions::Title)
                            .string()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Questions::Content)
                            .text()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Questions::UserId)
                            .integer()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Questions::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp())
                    )
                    .col(
                        ColumnDef::new(Questions::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp())
                    )
                    .col(
                        ColumnDef::new(Questions::ViewCount)
                            .integer()
                            .not_null()
                            .default(0)
                    )
                    .col(
                        ColumnDef::new(Questions::IsClosed)
                            .boolean()
                            .not_null()
                            .default(false)
                    )
                    .col(
                        ColumnDef::new(Questions::IsAnswered)
                            .boolean()
                            .not_null()
                            .default(false)
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_questions_users")
                            .from(Questions::Table, Questions::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
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
pub enum Questions {
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
