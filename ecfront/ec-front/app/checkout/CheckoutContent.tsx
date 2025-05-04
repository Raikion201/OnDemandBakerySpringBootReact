"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCart, clearDirectCheckoutItem } from "@/lib/features/cart/cartSlice";
import axios from "@/lib/axiosConfig";
import { ChevronLeft } from "lucide-react";

// Import the checkout schema from your original component
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  paymentMethod: z.literal("cash"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Always initialize these hooks, regardless of auth state
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector((state) => state.cart.total);
  const user = useAppSelector((state) => state.auth.user);
  const directCheckoutItem = useAppSelector((state) => state.cart.directCheckoutItem);
  
  // Form initialization
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || "",
      lastName: user?.name?.split(' ')[1] || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "cash",
    },
  });
  
  // Check if this is a direct checkout
  const isDirect = searchParams.get('direct') === 'true';
  
  // Calculate checkout items and total
  const checkoutItems = isDirect && directCheckoutItem 
    ? [directCheckoutItem] 
    : cartItems;
  
  const checkoutTotal = isDirect && directCheckoutItem 
    ? directCheckoutItem.productPrice * directCheckoutItem.quantity 
    : cartTotal;
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Check if user is authenticated and redirect to login if not
  useEffect(() => {
    if (!user) {
      // Save current URL with all parameters to redirect back after login
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentUrl);
        
        // Redirect to login page
        router.push('/login');
      }
    }
  }, [user, router]);
  
  // Redirect if there are no items to check out
  useEffect(() => {
    if (!orderPlaced && (
      (isDirect && !directCheckoutItem) || 
      (!isDirect && cartItems.length === 0)
    )) {
      router.push("/products");
    }
  }, [isDirect, directCheckoutItem, cartItems, orderPlaced, router]);

  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    // Your existing submit logic
    // ...
  };

  if (orderPlaced && orderNumber) {
    // Order success view
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {/* Your existing order success UI */}
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/products')}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Your existing checkout form structure */}
        {/* ... */}
      </div>
    </div>
  );
}
