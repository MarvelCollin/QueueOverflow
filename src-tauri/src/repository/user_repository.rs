use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::Utc;
use rand_core::OsRng;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
};

use crate::entities::users::{
    self, ActiveModel as UserActiveModel, Entity as Users, Model as UserModel,
};
use crate::models::user_models::{LoginRequest, RegisterRequest, UserResponse};

pub struct UserRepository;

impl UserRepository {
    pub async fn find_by_id(db: &DatabaseConnection, id: i32) -> Result<Option<UserModel>, DbErr> {
        Users::find_by_id(id).one(db).await
    }

    pub async fn find_by_email(
        db: &DatabaseConnection,
        email: &str,
    ) -> Result<Option<UserModel>, DbErr> {
        Users::find()
            .filter(users::Column::Email.eq(email))
            .one(db)
            .await
    }

    pub async fn find_by_username(
        db: &DatabaseConnection,
        username: &str,
    ) -> Result<Option<UserModel>, DbErr> {
        Users::find()
            .filter(users::Column::Username.eq(username))
            .one(db)
            .await
    }

    pub async fn register(
        db: &DatabaseConnection,
        req: RegisterRequest,
    ) -> Result<UserModel, String> {
        let username_exists = Self::find_by_username(db, &req.username)
            .await
            .map_err(|e| format!("Database error: {}", e))?
            .is_some();

        if username_exists {
            return Err("Username already exists".to_string());
        }

        let email_exists = Self::find_by_email(db, &req.email)
            .await
            .map_err(|e| format!("Database error: {}", e))?
            .is_some();

        if email_exists {
            return Err("Email already exists".to_string());
        }

        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let password_hash = argon2
            .hash_password(req.password.as_bytes(), &salt)
            .map_err(|e| format!("Password hashing error: {}", e))?
            .to_string();

        let user = UserActiveModel {
            username: Set(req.username),
            email: Set(req.email),
            password_hash: Set(password_hash),
            display_name: Set(req.display_name),
            bio: Set(None),
            reputation: Set(0),
            created_at: Set(Utc::now().into()),
            last_login: Set(None),
            avatar_url: Set(None),
            is_active: Set(1),
            ..Default::default()
        };

        user.insert(db)
            .await
            .map_err(|e| format!("Failed to insert user: {}", e))
    }

    pub async fn login(db: &DatabaseConnection, req: LoginRequest) -> Result<UserModel, String> {
        let user = Self::find_by_email(db, &req.email)
            .await
            .map_err(|e| format!("Database error: {}", e))?
            .ok_or_else(|| "User not found".to_string())?;

        let parsed_hash = PasswordHash::new(&user.password_hash)
            .map_err(|e| format!("Failed to parse password hash: {}", e))?;

        Argon2::default()
            .verify_password(req.password.as_bytes(), &parsed_hash)
            .map_err(|_| "Invalid password".to_string())?;

        let mut user_active: UserActiveModel = user.clone().into();
        user_active.last_login = Set(Some(Utc::now().into()));

        let user = user_active
            .update(db)
            .await
            .map_err(|e| format!("Failed to update last login: {}", e))?;

        Ok(user)
    }

    pub fn model_to_response(user: UserModel) -> UserResponse {
        UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            bio: user.bio,
            reputation: user.reputation,
            avatar_url: user.avatar_url,
            created_at: user.created_at.to_string(),
        }
    }
}
