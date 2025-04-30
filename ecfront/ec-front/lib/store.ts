import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/todos/authSlice';
import userReducer from './features/todos/userSlice';
import adminAuthReducer from './features/admin/adminAuthSlice';

// This function creates and returns the store
export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      adminAuth: adminAuthReducer,
    },
  });
}

// Create the store
export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;