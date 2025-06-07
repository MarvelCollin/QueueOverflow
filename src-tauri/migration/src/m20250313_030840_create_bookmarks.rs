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
                    .table(Bookmarks::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Bookmarks::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Bookmarks::UserId).integer().not_null())
                    .col(ColumnDef::new(Bookmarks::TargetId).integer().not_null())
                    .col(
                        ColumnDef::new(Bookmarks::TargetType)
                            .string()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Bookmarks::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Bookmarks::Title).string().not_null())
                    .col(ColumnDef::new(Bookmarks::Note).text().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_bookmarks_users")
                            .from(Bookmarks::Table, Bookmarks::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Bookmarks::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
pub enum Bookmarks {
    Table,
    Id,
    UserId,
    TargetId,
    TargetType,
    CreatedAt,
    Title,
    Note,
}

#[derive(DeriveIden)]
pub enum TargetType {
    Table,
    #[sea_orm(iden = "question")]
    Question,
    #[sea_orm(iden = "answer")]
    Answer,
} 