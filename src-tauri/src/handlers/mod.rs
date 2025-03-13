pub mod user_handlers;

// Export commonly used handler functions for easier imports
pub use user_handlers::{register, login, get_current_user};