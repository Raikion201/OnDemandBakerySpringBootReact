import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axiosConfig'; // Adjust the path to your axios configuration
import { AuthResponse, AuthState } from '@/types/auth';
import { RootState } from '@/lib/store';

// Load user from localStorage if available
const loadUserFromStorage = (): any => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        return null;
      }
    }
  }
  return null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  loading: false,
  error: null
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string;
    name: string;
    email: string;
    password: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(
        '/api/auth/register',  // Use relative URL (baseURL is set in axiosConfig)
        userData
      );  
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: unknown) {
      console.log(error)
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data || 'Registration failed');
      }
      return rejectWithValue('Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: {
    loginID: string;
    password: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(
        '/api/auth/login',  // Use relative URL (baseURL is set in axiosConfig)
        userData
      );
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      console.log(response)
      return response.data;
    } catch (error) {

      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Wrong password or username');
    }
  }
);

// Add an async thunk for logout to handle API call
export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { rejectWithValue }) => {
    try {
      // Call the logout endpoint
      await axios.post('/api/auth/logout');
      
      // Clear both user and admin user from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser'); // Also remove admin user
      }
      
      // Return success
      return true;
    } catch (error: any) {
      // Even if the API call fails, remove user from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser'); // Also remove admin user
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to logout'
      );
    }
  }
);

// Add this new thunk after the existing ones
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/auth/me');
      console.log("Auth check response:", response.data);
      
      // If we got a successful response, return the user data and store it
      if (response.data) {
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      } else {
        return rejectWithValue('Authentication failed');
      }
    } catch (error) {
      console.error("Auth check error:", error);
      return rejectWithValue('Not authenticated');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      // Also remove from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser'); // Also remove admin user
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;     // store registered user
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;     // store logged‑in user
      })
      .addCase(login.rejected, (state, action) => {
        console.log(state)
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add case for logout async thunk
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutAsync.rejected, (state) => {
        // Even if the API call fails, we should still log out locally
        state.user = null;
        state.loading = false;
      })
      // Add these new cases for checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;