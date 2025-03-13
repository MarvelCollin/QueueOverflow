use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(QuestionTags::Table)
                    .if_not_exists()
                    .col(integer(QuestionTags::QuestionId).not_null())
                    .col(integer(QuestionTags::TagId).not_null())
                    .primary_key(
                        Index::create()
                            .col(QuestionTags::QuestionId)
                            .col(QuestionTags::TagId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_question_tags_questions")
                            .from(QuestionTags::Table, QuestionTags::QuestionId)
                            .to(Questions::Table, Questions::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_question_tags_tags")
                            .from(QuestionTags::Table, QuestionTags::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(QuestionTags::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum QuestionTags {
    Table,
    QuestionId,
    TagId,
}

#[derive(DeriveIden)]
enum Questions {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Tags {
    Table,
    Id,
}
