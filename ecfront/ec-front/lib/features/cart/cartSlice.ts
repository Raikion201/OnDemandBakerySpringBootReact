import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for cart items
export interface CartItem {
  productId: number;
  quantity: number;
  productName?: string;
  productPrice?: number;
  productImageUrl?: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

// Define the shape of the payload for addItemToCart action
export interface AddToCartPayload {
  productId: number;
  quantity: number;
  productDetails: {
    name: string;
    price: number;
    imageUrl: string | null;
  }
}

const calculateCartTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { productId, quantity, productDetails } = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        state.items.push({
          productId,
          quantity,
          productName: productDetails.name,
          productPrice: productDetails.price,
          productImageUrl: productDetails.imageUrl
        });
      }
      
      // Update totals
      state.total = calculateCartTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    
    updateItemQuantity: (state, action: PayloadAction<{ productId: number, quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        item.quantity = quantity;
        state.total = calculateCartTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
      }
    },
    
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      state.total = calculateCartTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { addItemToCart, updateItemQuantity, removeItem, clearCart, setLoading } = cartSlice.actions;
export default cartSlice.reducer;
