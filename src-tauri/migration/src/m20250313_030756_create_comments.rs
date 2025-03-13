use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_type(
                Type::create()
                    .as_enum(ParentType::Type)
                    .values([ParentType::Question, ParentType::Answer])
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(Comments::Table)
                    .if_not_exists()
                    .col(pk_auto(Comments::Id))
                    .col(text(Comments::Content).not_null())
                    .col(integer(Comments::UserId).not_null())
                    .col(
                        timestamp_with_time_zone(Comments::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(Comments::ParentId).not_null())
                    .col(custom_type(
                        Comments::ParentType,
                        ParentType::Type.to_string(),
                        ParentType::Type.to_string(),
                    ))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_comments_users")
                            .from(Comments::Table, Comments::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Comments::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(ParentType::Type).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Comments {
    Table,
    Id,
    Content,
    UserId,
    CreatedAt,
    ParentId,
    ParentType,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum ParentType {
    #[sea_orm(iden = "parent_type")]
    Type,
    #[sea_orm(iden = "question")]
    Question,
    #[sea_orm(iden = "answer")]
    Answer,
}
