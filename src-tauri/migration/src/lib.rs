pub use sea_orm_migration::prelude::*;

mod m20250313_030734_create_users;
mod m20250313_030738_create_questions;
mod m20250313_030743_create_answers;
mod m20250313_030756_create_comments;
mod m20250313_030800_create_tags;
mod m20250313_030810_create_question_tags;
mod m20250313_030821_create_votes;
mod m20250313_030840_create_bookmarks;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250313_030734_create_users::Migration),
            Box::new(m20250313_030738_create_questions::Migration),
            Box::new(m20250313_030743_create_answers::Migration),
            Box::new(m20250313_030756_create_comments::Migration),
            Box::new(m20250313_030800_create_tags::Migration),
            Box::new(m20250313_030810_create_question_tags::Migration),
            Box::new(m20250313_030821_create_votes::Migration),
            Box::new(m20250313_030840_create_bookmarks::Migration),
        ]
    }
}
