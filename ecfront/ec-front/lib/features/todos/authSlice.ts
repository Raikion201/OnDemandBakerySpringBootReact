import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axiosConfig'; // Adjust the path to your axios configuration
import { AuthResponse, AuthState } from '@/types/auth';
import { RootState } from '@/lib/store';

const initialState: AuthState = {
  user: null,
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
        'http://localhost:8080/api/auth/register',
        userData
      );      
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
        'http://localhost:8080/api/auth/login',
        userData
      );
      
      // Store tokens in localStorage
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
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
      });
  },
});

export const { logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;