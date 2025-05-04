"use client";

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ShoppingCart, 
  X, 
  Minus, 
  Plus, 
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { 
  clearCart, 
  removeItem, 
  updateItemQuantity,
  initializeCart
} from '@/lib/features/cart/cartSlice';
import { useEffect } from 'react';

interface CartComponentProps {
  variant?: 'icon' | 'button';
}

export function CartComponent({ variant = 'icon' }: CartComponentProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Safely access cart state
  const cartState = useAppSelector((state) => state.cart);
  const items = cartState?.items || [];
  const total = cartState?.total || 0;
  const itemCount = cartState?.itemCount || 0;
  const loading = cartState?.loading || false;
  
  // Load cart from localStorage when component mounts
  useEffect(() => {
    const loadCartFromLocalStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            dispatch(initializeCart(parsedCart));
          }
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    };

    // Only run if cart is empty - this prevents overwriting current cart state
    if (items.length === 0) {
      loadCartFromLocalStorage();
    }
  }, [dispatch, items.length]);
  
  // Handle quantity changes
  const handleQuantityChange = (productId: number, newQuantity: number, maxQuantity: number = Infinity) => {
    if (newQuantity <= 0) {
      // Remove item
      dispatch(removeItem(productId));
    } else if (newQuantity <= maxQuantity) {
      // Only update if the new quantity doesn't exceed available stock
      dispatch(updateItemQuantity({ productId, quantity: newQuantity }));
    }
  };

  // Clear the cart
  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    
    // Remove toast notification
    // router.push('/checkout');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        ) : (
          <Button className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Cart ({itemCount})</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex justify-between items-center">
            <span>Your Cart ({itemCount} items)</span>
            {itemCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearCart}
                className="text-muted-foreground text-xs flex items-center gap-1"
                disabled={loading}
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">          
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground mt-1">Add some delicious items to your cart</p>
            </div>
          )}
          
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 py-4 border-b">
              <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                {item.productImageUrl ? (
                  <img 
                  src={
                    item.productImageUrl.startsWith("http")
                        ? product.imageUrl
                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/images/${item.productImageUrl.split('/').pop()}`
                
                    }
                    alt={item.productName || 'Product'} 
                    className="h-full w-full object-cover rounded-md"
                    onError={(e) => {
                      console.error("Image failed to load:", item.productImageUrl);
                      (e.target as HTMLImageElement).src = "/placeholder-image.png";
                      // Fallback to data URI if no placeholder image exists
                      (e.target as HTMLImageElement).onerror = () => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E";
                      };
                    }}
                  />
          
                ) : (
                  <div className="text-xs text-muted-foreground">No image</div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.productName || `Product #${item.productId}`}</h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => dispatch(removeItem(item.productId))}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-muted-foreground text-sm">
                  {formatPrice(item.productPrice || 0)}
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={loading}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.maxQuantity)}
                      disabled={loading || item.quantity >= (item.maxQuantity || 0)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="font-medium">
                    {formatPrice((item.productPrice || 0) * item.quantity)}
                  </div>
                </div>
                
                {/* Show stock availability message if needed */}
                {item.maxQuantity && item.quantity >= item.maxQuantity && (
                  <div className="text-xs text-amber-600 mt-1">
                    Max quantity reached
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between py-2">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          
          <Button 
            className="w-full mt-4" 
            size="lg"
            onClick={handleCheckout}
            disabled={items.length === 0 || loading}
          >
            Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
