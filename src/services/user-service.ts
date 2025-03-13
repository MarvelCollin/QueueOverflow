import { invoke } from "@tauri-apps/api/core";

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  bio?: string | null;
  reputation: number;
  avatar_url?: string | null;
  created_at: string;
  last_login?: string | null;
  is_active: number;
}

interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name: string;
}

class UserService {
  private static instance: UserService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      this.currentUser = JSON.parse(storedUser);
      this.token = storedToken;
    }
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async login(request: LoginRequest): Promise<User> {
    try {
      const response = await invoke<AuthResponse>("login", { request });
      this.setUserAndToken(response);
      return response.user;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  async register(request: RegisterRequest): Promise<User> {
    try {
      const response = await invoke<AuthResponse>("register", { request });
      this.setUserAndToken(response);
      return response.user;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser || !this.token) {
      return null;
    }

    try {
      const user = await invoke<User>("get_current_user", {
        userId: this.currentUser.id,
      });
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  }

  private setUserAndToken(response: AuthResponse): void {
    this.currentUser = response.user;
    this.token = response.token;
    localStorage.setItem("currentUser", JSON.stringify(response.user));
    localStorage.setItem("token", response.token);
  }
}

export const userService = UserService.getInstance();
