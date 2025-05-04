import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for cart items
export interface CartItem {
  productId: number;
  quantity: number;
  productName?: string;
  productPrice?: number;
  productImageUrl?: string;
  lineTotal?: number;
  maxQuantity?: number; // Add max quantity field
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
  directCheckoutItem: CartItem | null; // Add this for direct checkout
}

// Define the shape of the payload for addItemToCart action
export interface AddToCartPayload {
  productId: number;
  quantity: number;
  productDetails: {
    name: string;
    price: number;
    imageUrl: string | null;
    maxQuantity?: number; // Include maxQuantity in product details
  }
}

// Helper function to load cart from localStorage
const loadCartFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedData = JSON.parse(savedCart);
        // Ensure we return an array even if the stored data is not an array
        return Array.isArray(parsedData) ? parsedData : [];
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
    }
  }
  return [];
};

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

// Helper functions to calculate totals
const calculateCartTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Initial state with proper typing and default values
const initialState: CartState = {
  items: loadCartFromLocalStorage() || [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
  directCheckoutItem: null // Initialize direct checkout item
};

// Set initial totals based on loaded items
if (Array.isArray(initialState.items)) {
  initialState.total = calculateCartTotal(initialState.items);
  initialState.itemCount = calculateItemCount(initialState.items);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add initializeCart action
    initializeCart: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
        state.total = calculateCartTotal(action.payload);
        state.itemCount = calculateItemCount(action.payload);
      }
    },
    
    addItemToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { productId, quantity, productDetails } = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex((item) => item.productId === productId);
      const maxQuantity = productDetails.maxQuantity || Infinity;
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists without exceeding max quantity
        const newQuantity = state.items[existingItemIndex].quantity + quantity;
        state.items[existingItemIndex].quantity = Math.min(newQuantity, maxQuantity);
      } else {
        // Add new item to cart
        state.items.push({
          productId,
          quantity: Math.min(quantity, maxQuantity),
          productName: productDetails.name,
          productPrice: productDetails.price,
          productImageUrl: productDetails.imageUrl,
          maxQuantity: productDetails.maxQuantity
        });
      }
      
      // Update totals
      state.total = calculateCartTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    updateItemQuantity: (state, action: PayloadAction<{ productId: number, quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.productId === productId);
      
      if (item) {
        // Don't exceed maximum quantity
        item.quantity = item.maxQuantity ? 
          Math.min(quantity, item.maxQuantity) : 
          quantity;
        
        // Update totals
        state.total = calculateCartTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      state.total = calculateCartTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      
      // Save to localStorage after update
      saveCartToLocalStorage(state.items);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      
      // Clear localStorage cart
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Add reducer for setting direct checkout item
    setDirectCheckoutItem: (state, action: PayloadAction<CartItem | null>) => {
      state.directCheckoutItem = action.payload;
    },
    
    // Add reducer for clearing direct checkout item
    clearDirectCheckoutItem: (state) => {
      state.directCheckoutItem = null;
    },
  }
});

export const { 
  addItemToCart, 
  updateItemQuantity, 
  removeItem, 
  clearCart,
  setLoading,
  initializeCart,
  setDirectCheckoutItem,
  clearDirectCheckoutItem
} = cartSlice.actions;
export default cartSlice.reducer;
