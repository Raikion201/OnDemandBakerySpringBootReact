export interface AuthResponse {
    name: string;
    username: string;
    email: string;
  }
  
  export interface AuthState {
    user: {name: string; username: string; email: string } | null;
    loading: boolean;
    error: string | null;
  }