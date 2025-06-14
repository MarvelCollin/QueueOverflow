use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Users::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key()
                    )
                    .col(
                        ColumnDef::new(Users::Username)
                            .string()
                            .not_null()
                            .unique_key()
                    )
                    .col(
                        ColumnDef::new(Users::Email)
                            .string()
                            .not_null()
                            .unique_key()
                    )
                    .col(
                        ColumnDef::new(Users::PasswordHash)
                            .string()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Users::DisplayName)
                            .string()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(Users::Bio)
                            .text()
                            .null()
                    )
                    .col(
                        ColumnDef::new(Users::Reputation)
                            .integer()
                            .not_null()
                            .default(0)
                    )
                    .col(
                        ColumnDef::new(Users::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp())
                    )
                    .col(
                        ColumnDef::new(Users::LastLogin)
                            .timestamp_with_time_zone()
                            .null()
                    )
                    .col(
                        ColumnDef::new(Users::AvatarUrl)
                            .string()
                            .null()
                    )
                    .col(
                        ColumnDef::new(Users::IsActive)
                            .boolean()
                            .not_null()
                            .default(true)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
pub enum Users {
    Table,
    Id,
    Username,
    Email,
    PasswordHash,
    DisplayName,
    Bio,
    Reputation,
    CreatedAt,
    LastLogin,
    AvatarUrl,
    IsActive,
}
