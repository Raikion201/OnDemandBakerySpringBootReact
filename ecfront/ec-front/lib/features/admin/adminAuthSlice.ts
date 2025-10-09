import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axiosConfig';

interface AdminUser {
  username: string;
  email: string;
  name: string;
  roles?: string[];
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  roles: string[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  adminUser: null,
  roles: [],
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async (credentials: { loginID: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/admin/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Admin login failed');
      }
      return rejectWithValue('Admin login failed');
    }
  }
);

// This thunk will verify authentication status and fetch user info
export const checkAdminAuth = createAsyncThunk(
  'adminAuth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/auth/me');
      console.log("Auth check response:", response.data);
      
      // If we got a successful response, check if user has admin roles
      if (response.data) {
        const userData = response.data;
        const roles = userData.roles || [];
        
        // Check if user has admin/staff/owner role
        const hasAdminRole = roles.some((role: string) => 
          role === 'ROLE_ADMIN' || 
          role === 'ROLE_STAFF' || 
          role === 'ROLE_OWNER'
        );
        
        if (!hasAdminRole) {
          return rejectWithValue('User does not have admin privileges');
        }
        
        return userData;
      } else {
        return rejectWithValue('Authentication failed');
      }
    } catch (error) {
      console.error("Auth check error:", error);
      return rejectWithValue('Not authenticated as admin');
    }
  }
);

export const adminLogout = createAsyncThunk(
  'adminAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call the logout endpoint
      await axios.post('/api/auth/logout');
      
      // Clear both admin user and regular user from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user'); // Also remove regular user
      }
      
      return true;
    } catch (error: any) {
      // Even if the API call fails, remove both admin and regular user from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user'); // Also remove regular user
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to logout'
      );
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    // Add a synchronous logout action like in authSlice
    logout: (state) => {
      state.adminUser = null;
      state.isAuthenticated = false;
      state.roles = [];
      
      // Also remove both admin and regular user from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user'); // Also remove regular user
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.adminUser = action.payload;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Check auth cases
      .addCase(checkAdminAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.adminUser = action.payload;
        state.roles = action.payload.roles || [];
        console.log("Updated admin user in state:", action.payload);
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.adminUser = null;
      })
      
      // Logout cases - update to handle rejected case properly
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.adminUser = null;
        state.roles = [];
      })
      .addCase(adminLogout.rejected, (state) => {
        // Even if the API call fails, still log out locally
        state.isAuthenticated = false;
        state.adminUser = null;
        state.roles = [];
      });
  },
});

export const { clearAdminError, logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
