"use client";

import { useState } from 'react';
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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartComponentProps {
  variant?: 'icon' | 'button';
}

export function CartComponent({ variant = 'icon' }: CartComponentProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Calculate total and item count
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle quantity changes
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      // Update quantity
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Clear the cart
  const clearCart = () => {
    setCartItems([]);
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
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    toast.success('Checkout functionality coming soon!');
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
                onClick={clearCart}
                className="text-muted-foreground text-xs flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">          
          {cartItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground mt-1">Add some delicious items to your cart</p>
            </div>
          )}
          
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 py-4 border-b">
              <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-full w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">No image</div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleQuantityChange(item.id, 0)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-muted-foreground text-sm">
                  {formatPrice(item.price)}
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between py-2">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          
          <Button 
            className="w-full mt-4" 
            size="lg"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
