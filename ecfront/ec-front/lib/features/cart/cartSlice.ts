import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Cart, CartItem, 
  getInitialCart, 
  addItemToCart as addItemToCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  removeItemFromCart as removeItemFromCartUtil,
  clearCart as clearCartUtil,
  syncCartWithServer
} from '@/lib/cartUtils';

interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
  lastSynced: number | null;
}

// Initial state
const initialState: CartState = {
  cart: getInitialCart(),
  loading: false,
  error: null,
  lastSynced: null
};

// Async thunk for syncing cart with server
export const syncCart = createAsyncThunk(
  'cart/sync',
  async (cart: Cart, { rejectWithValue }) => {
    try {
      const updatedCart = await syncCartWithServer(cart);
      return updatedCart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<{ 
      productId: number; 
      quantity?: number;
      productDetails?: { name: string; price: number; imageUrl?: string }
    }>) => {
      const { productId, quantity = 1, productDetails } = action.payload;
      state.cart = addItemToCartUtil(state.cart, productId, quantity, productDetails);
    },
    
    updateItemQuantity: (state, action: PayloadAction<{ 
      productId: number; 
      quantity: number 
    }>) => {
      const { productId, quantity } = action.payload;
      state.cart = updateCartItemQuantityUtil(state.cart, productId, quantity);
    },
    
    removeItem: (state, action: PayloadAction<number>) => {
      state.cart = removeItemFromCartUtil(state.cart, action.payload);
    },
    
    clearCart: (state) => {
      state.cart = clearCartUtil();
    },
    
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
        state.lastSynced = Date.now();
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to sync cart';
      });
  }
});

// Export actions and reducer
export const { 
  addItemToCart, 
  updateItemQuantity, 
  removeItem, 
  clearCart,
  setCart
} = cartSlice.actions;

export default cartSlice.reducer;
