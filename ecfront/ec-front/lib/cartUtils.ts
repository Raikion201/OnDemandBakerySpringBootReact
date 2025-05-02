// Cart utilities for working with cookies and API

import Cookies from 'js-cookie';
import axios from './axiosConfig';

// Define types for cart data
export interface CartItem {
  productId: number;
  quantity: number;
  productName?: string;
  productPrice?: number;
  productImageUrl?: string;
  lineTotal?: number;
}

export interface Cart {
  id?: number;
  userId?: number;
  items: CartItem[];
  total: number;
  itemCount: number;
  cartCookieId: string;
}

// Cookie name for storing cart data
const CART_COOKIE_NAME = 'bakery_cart';
const CART_COOKIE_EXPIRY = 30; // Days

// Load cart from cookies
export const loadCartFromCookies = (): Cart | null => {
  const cartData = Cookies.get(CART_COOKIE_NAME);
  if (cartData) {
    try {
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Failed to parse cart cookie:', error);
      return null;
    }
  }
  return null;
};

// Save cart to cookies
export const saveCartToCookies = (cart: Cart): void => {
  Cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    expires: CART_COOKIE_EXPIRY,
    sameSite: 'lax',
    path: '/'
  });
};

// Remove cart from cookies
export const removeCartFromCookies = (): void => {
  Cookies.remove(CART_COOKIE_NAME, { path: '/' });
};

// Create a new empty cart
export const createEmptyCart = (): Cart => {
  return {
    items: [],
    total: 0,
    itemCount: 0,
    cartCookieId: generateCartId()
  };
};

// Generate a random cart ID
const generateCartId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Sync cart with server
export const syncCartWithServer = async (cart: Cart): Promise<Cart> => {
  try {
    // Format cart for API request
    const cartRequest = {
      cartCookieId: cart.cartCookieId,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    // Send request to server
    const response = await axios.post('/api/cart/sync', cartRequest);
    
    // Update local cart with server response
    const updatedCart = response.data;
    saveCartToCookies(updatedCart);
    
    return updatedCart;
  } catch (error) {
    console.error('Failed to sync cart with server:', error);
    return cart; // Return original cart on error
  }
};

// Add item to cart
export const addItemToCart = (
  cart: Cart, 
  productId: number, 
  quantity: number = 1,
  productDetails?: { name: string; price: number; imageUrl?: string }
): Cart => {
  // Make a copy of the cart
  const updatedCart = { ...cart };
  
  // Find existing item
  const existingItemIndex = updatedCart.items.findIndex(
    item => item.productId === productId
  );
  
  if (existingItemIndex >= 0) {
    // Update existing item
    updatedCart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const newItem: CartItem = {
      productId,
      quantity,
      productName: productDetails?.name,
      productPrice: productDetails?.price,
      productImageUrl: productDetails?.imageUrl
    };
    
    if (productDetails?.price) {
      newItem.lineTotal = productDetails.price * quantity;
    }
    
    updatedCart.items.push(newItem);
  }
  
  // Recalculate totals
  updatedCart.itemCount = updatedCart.items.length;
  updatedCart.total = updatedCart.items.reduce((sum, item) => {
    if (item.lineTotal) {
      return sum + item.lineTotal;
    } else if (item.productPrice) {
      return sum + (item.productPrice * item.quantity);
    }
    return sum;
  }, 0);
  
  // Save updated cart to cookies
  saveCartToCookies(updatedCart);
  
  return updatedCart;
};

// Update item quantity in cart
export const updateCartItemQuantity = (
  cart: Cart,
  productId: number,
  quantity: number
): Cart => {
  if (quantity <= 0) {
    return removeItemFromCart(cart, productId);
  }
  
  const updatedCart = { ...cart };
  const itemIndex = updatedCart.items.findIndex(item => item.productId === productId);
  
  if (itemIndex >= 0) {
    updatedCart.items[itemIndex].quantity = quantity;
    
    // Update line total if product price exists
    if (updatedCart.items[itemIndex].productPrice) {
      updatedCart.items[itemIndex].lineTotal = 
        updatedCart.items[itemIndex].productPrice! * quantity;
    }
    
    // Recalculate total
    updatedCart.total = updatedCart.items.reduce((sum, item) => {
      if (item.lineTotal) {
        return sum + item.lineTotal;
      } else if (item.productPrice) {
        return sum + (item.productPrice * item.quantity);
      }
      return sum;
    }, 0);
    
    saveCartToCookies(updatedCart);
  }
  
  return updatedCart;
};

// Remove item from cart
export const removeItemFromCart = (cart: Cart, productId: number): Cart => {
  const updatedCart = { ...cart };
  updatedCart.items = updatedCart.items.filter(item => item.productId !== productId);
  
  // Recalculate totals
  updatedCart.itemCount = updatedCart.items.length;
  updatedCart.total = updatedCart.items.reduce((sum, item) => {
    if (item.lineTotal) {
      return sum + item.lineTotal;
    } else if (item.productPrice) {
      return sum + (item.productPrice * item.quantity);
    }
    return sum;
  }, 0);
  
  saveCartToCookies(updatedCart);
  
  return updatedCart;
};

// Clear cart
export const clearCart = (): Cart => {
  const emptyCart = createEmptyCart();
  saveCartToCookies(emptyCart);
  return emptyCart;
};

// Get initial cart (from cookies or create new)
export const getInitialCart = (): Cart => {
  const cookieCart = loadCartFromCookies();
  return cookieCart || createEmptyCart();
};
