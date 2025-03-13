pub mod user_models;

// Re-export common types for easier imports
pub use user_models::{LoginRequest, RegisterRequest, UserResponse, AuthResponse, ErrorResponse};