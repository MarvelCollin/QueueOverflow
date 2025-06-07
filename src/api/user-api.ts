import { safeInvoke } from "./tauri-utils";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  bio?: string;
  location?: string;
  website_url?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website_url?: string;
  reputation: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface UserProfileResponse {
  user: UserResponse;
  question_count: number;
  answer_count: number;
  badges: Badge[];
}

export const userApi = {
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const result = await safeInvoke<AuthResponse>("register", { request });
    if (!result) throw new Error("Failed to register user");
    return result;
  },

  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const result = await safeInvoke<AuthResponse>("login", { request });
    if (!result) throw new Error("Failed to login user");
    return result;
  },

  getCurrentUser: async (userId: number): Promise<UserResponse> => {
    const result = await safeInvoke<UserResponse>("get_current_user", {
      user_id: userId,
    });
    if (!result) throw new Error("Failed to get current user");
    return result;
  },

  getUserProfile: async (
    profileUserId: number
  ): Promise<UserProfileResponse> => {
    const result = await safeInvoke<UserProfileResponse>("get_user_profile", {
      profile_user_id: profileUserId,
    });
    if (!result) throw new Error("Failed to get user profile");
    return result;
  },

  updateProfile: async (
    userId: number,
    request: UpdateProfileRequest
  ): Promise<UserResponse> => {
    const result = await safeInvoke<UserResponse>("update_profile", {
      user_id: userId,
      request,
    });
    if (!result) throw new Error("Failed to update profile");
    return result;
  },

  changePassword: async (
    userId: number,
    request: ChangePasswordRequest
  ): Promise<void> => {
    const result = await safeInvoke<void>("change_password", {
      user_id: userId,
      request,
    });
    if (result === null) throw new Error("Failed to change password");
  },
};
