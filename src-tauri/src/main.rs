#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sea_orm::{Database, DatabaseConnection, DbErr, EntityTrait};
use sea_orm_migration::{SchemaManager, prelude::*};
use tauri::State;

mod greet_entity {
    use sea_orm::entity::prelude::*;

    #[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
    #[sea_orm(table_name = "greet")]
    pub struct Model {
        #[sea_orm(primary_key)]
        pub id: i32,
        pub name: String,
    }

    #[derive(Copy, Clone, Debug, EnumIter)]
    pub enum Relation {}

    impl RelationTrait for Relation {
        fn def(&self) -> RelationDef {
            panic!("No relations defined")
        }
    }

    impl ActiveModelBehavior for ActiveModel {}
}

use greet_entity as entity;

#[derive(Iden)]
enum Greet {
    Table,
    Id,
    Name,
}

async fn run_migration(db: &DatabaseConnection) -> Result<(), DbErr> {
    let schema_manager = SchemaManager::new(db);
    schema_manager
        .create_table(
            Table::create()
                .table(Greet::Table)
                .if_not_exists()
                .col(ColumnDef::new(Greet::Id)
                    .integer()
                    .not_null()
                    .auto_increment()
                    .primary_key())
                .col(ColumnDef::new(Greet::Name).string().not_null())
                .to_owned(),
        )
        .await?;
    Ok(())
}

#[tauri::command]
async fn greet(name: &str, state: State<'_, DatabaseConnection>) -> Result<String, String> {
    use sea_orm::{ActiveModelTrait, Set};

    let new_entry = entity::ActiveModel {
        name: Set(name.to_owned()),
        ..Default::default()
    };
    entity::Entity::insert(new_entry)
        .exec(state.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(format!(
        "Hello, {}! You've been greeted and saved to database!",
        name
    ))
}

#[tokio::main]
async fn main() {
    let db_url = "mysql://root:@localhost:3306/tpa_desktop";
    let db = Database::connect(db_url)
        .await
        .expect("Failed to connect to database");

    run_migration(&db)
        .await
        .expect("Failed to run migration");
    
    println!("Migration completed successfully!");

    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
