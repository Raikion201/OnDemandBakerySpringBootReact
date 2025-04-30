import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axiosConfig';

interface AdminUser {
  username: string;
  email: string;
  name: string;
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

export const checkAdminAuth = createAsyncThunk(
  'adminAuth/check',
  async (_, { rejectWithValue }) => {
    try {
      // Call a protected admin endpoint to check if the admin is authenticated
      const response = await axios.get('/api/admin/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue('Not authenticated as admin');
    }
  }
);

export const adminLogout = createAsyncThunk(
  'adminAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/api/auth/logout');
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
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
        // We would extract roles from the admin user data here
        // This assumes the API returns role information
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
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.adminUser = null;
      })
      
      // Logout cases
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.adminUser = null;
        state.roles = [];
      });
  },
});

export const { clearAdminError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
