import { configureStore } from '@reduxjs/toolkit';
// Import your existing reducers
import authReducer from './features/todos/authSlice';
import userReducer from './features/todos/userSlice';
import adminAuthReducer from './features/admin/adminAuthSlice';
import productReducer from './features/products/productSlice';
import cartReducer from './features/cart/cartSlice';
import orderReducer from './features/orders/orderSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      adminAuth: adminAuthReducer,
      products: productReducer,
      cart: cartReducer,
      orders: orderReducer,
    },
  });
};

// Create the store
export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;