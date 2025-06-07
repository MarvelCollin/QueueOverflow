# QueueOverflow

A Stack Overflow clone built with Tauri, React, and Sea-ORM.

## Changes Made to Fix User Login and Registration

The following changes were made to get the user login and registration functionality working with the database:

1. **Database Configuration**:
   - Changed from in-memory SQLite to file-based SQLite database (`queue_overflow.db`)
   - Added migration execution during application startup to ensure database tables are created

2. **User Authentication**:
   - Fixed error handling in Rust backend by simplifying error responses
   - Updated frontend code to better handle API responses and errors
   - Fixed token generation and storage

3. **API Consistency**:
   - Updated question API endpoints to use `safeInvoke` instead of direct `invoke` calls
   - Improved error handling across all API calls

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Run the application:
   ```
   npm run tauri dev
   ```

The application will now use a persistent SQLite database file located at `src-tauri/queue_overflow.db`.

## Features

- User registration and login
- Remember me functionality
- Guest mode
- Error handling and validation
- Secure password storage with Argon2 hashing
