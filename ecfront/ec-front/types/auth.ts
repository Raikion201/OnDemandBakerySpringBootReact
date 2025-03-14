export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface AuthState {
    user: {username: string; email: string } | null;
    loading: boolean;
    error: string | null;
  }