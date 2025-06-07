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
use crate::models::user_models::{LoginRequest, RegisterRequest, UserResponse, UpdateProfileRequest, ChangePasswordRequest};

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

    pub async fn update_profile(
        db: &DatabaseConnection,
        user_id: i32,
        req: UpdateProfileRequest,
    ) -> Result<UserModel, String> {
        let user = Users::find_by_id(user_id)
            .one(db)
            .await
            .map_err(|e| format!("Database error: {}", e))?
            .ok_or_else(|| "User not found".to_string())?;

        let mut user_active: UserActiveModel = user.into();

        if let Some(display_name) = req.display_name {
            if display_name.trim().is_empty() {
                return Err("Display name cannot be empty".to_string());
            }
            user_active.display_name = Set(display_name);
        }

        if let Some(bio) = req.bio {
            user_active.bio = Set(Some(bio));
        }

        if let Some(avatar_url) = req.avatar_url {
            user_active.avatar_url = Set(Some(avatar_url));
        }

        user_active
            .update(db)
            .await
            .map_err(|e| format!("Failed to update profile: {}", e))
    }

    pub async fn change_password(
        db: &DatabaseConnection,
        user_id: i32,
        req: ChangePasswordRequest,
    ) -> Result<(), String> {
        let user = Users::find_by_id(user_id)
            .one(db)
            .await
            .map_err(|e| format!("Database error: {}", e))?
            .ok_or_else(|| "User not found".to_string())?;

        let parsed_hash = PasswordHash::new(&user.password_hash)
            .map_err(|e| format!("Failed to parse password hash: {}", e))?;

        Argon2::default()
            .verify_password(req.current_password.as_bytes(), &parsed_hash)
            .map_err(|_| "Current password is incorrect".to_string())?;

        if req.new_password.len() < 8 {
            return Err("New password must be at least 8 characters long".to_string());
        }

        if req.new_password != req.confirm_password {
            return Err("New password and confirmation do not match".to_string());
        }

        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let password_hash = argon2
            .hash_password(req.new_password.as_bytes(), &salt)
            .map_err(|e| format!("Password hashing error: {}", e))?
            .to_string();

        let mut user_active: UserActiveModel = user.into();
        user_active.password_hash = Set(password_hash);

        user_active
            .update(db)
            .await
            .map_err(|e| format!("Failed to update password: {}", e))?;

        Ok(())
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
