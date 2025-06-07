use sea_orm_migration::prelude::*;
use crate::m20250313_030738_create_questions::Questions;
use crate::m20250313_030800_create_tags::Tags;

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
                    .col(
                        ColumnDef::new(QuestionTags::QuestionId)
                            .integer()
                            .not_null()
                    )
                    .col(
                        ColumnDef::new(QuestionTags::TagId)
                            .integer()
                            .not_null()
                    )
                    .primary_key(
                        Index::create()
                            .col(QuestionTags::QuestionId)
                            .col(QuestionTags::TagId)
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_question_tags_questions")
                            .from(QuestionTags::Table, QuestionTags::QuestionId)
                            .to(Questions::Table, Questions::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_question_tags_tags")
                            .from(QuestionTags::Table, QuestionTags::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade)
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
pub enum QuestionTags {
    Table,
    QuestionId,
    TagId,
}
