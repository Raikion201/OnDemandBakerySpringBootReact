"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCart, clearDirectCheckoutItem } from "@/lib/features/cart/cartSlice";
import axios from "@/lib/axiosConfig";
import { ChevronLeft } from "lucide-react";

// Update the checkout schema to remove email field
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Remove email field
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  paymentMethod: z.literal("cash"), // Changed to only accept "cash"
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Always initialize these hooks, regardless of auth state
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector((state) => state.cart.total);
  const user = useAppSelector((state) => state.auth.user);
  const directCheckoutItem = useAppSelector((state) => state.cart.directCheckoutItem);
  
  // Form initialization - MUST be called in every render
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName:  "",
      lastName:  "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "cash",
    },
  });
  
  // Check if this is a direct checkout based on directCheckoutItem existence
  const isDirect = !!directCheckoutItem;
  
  // Calculate checkout items and total
  const checkoutItems = isDirect 
    ? [directCheckoutItem] 
    : cartItems;
  
  const checkoutTotal = isDirect 
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
    setSubmitting(true);
    
    try {
      // Create order payload without email
      const orderPayload = {
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        orderItems: checkoutItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        })),
        paymentMethod: data.paymentMethod,
        totalAmount: checkoutTotal,
        directPurchase: isDirect
      };

      // Send the order to the backend
      const response = await axios.post('/api/orders/checkout', orderPayload);
      
      // Get the order number from response
      const generatedOrderNumber = response.data.orderNumber;
      setOrderNumber(generatedOrderNumber);
      
      // Clear relevant state based on checkout type
      if (isDirect) {
        dispatch(clearDirectCheckoutItem());
      } else {
        dispatch(clearCart());
      }
      
      // Set order as placed
      setOrderPlaced(true);
      
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Render placeholder/loading UI if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8 md:px-6 md:py-12 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-6">Please log in to continue with checkout.</p>
            <div className="animate-pulse">Redirecting to login page...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show order confirmation if order was placed
  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Order Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 text-green-600 p-4 rounded-md text-center">
                <h3 className="text-xl font-semibold mb-2">Thank You For Your Order!</h3>
                <p>Your order has been received and is being processed.</p>
              </div>
              
              <div className="text-center">
                <p className="text-muted-foreground">Your Order Number</p>
                <p className="text-2xl font-bold">{orderNumber}</p>
              </div>
              
              
              <div className="flex justify-center pt-4">
                <Button onClick={() => router.push("/products")}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Main checkout UI
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12 mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="self-start mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {isDirect ? "Back to Product" : "Back to Cart"}
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          {isDirect && (
            <p className="text-muted-foreground mt-2">
              You are checking out with a direct purchase
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Checkout Form - 2/3 width on md screens */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        {...register("firstName")} 
                        disabled={submitting} 
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        {...register("lastName")} 
                        disabled={submitting} 
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Replace the grid containing email and phone with just phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      {...register("phone")} 
                      disabled={submitting} 
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address" 
                      {...register("address")} 
                      disabled={submitting} 
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm">{errors.address.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        {...register("city")} 
                        disabled={submitting} 
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        {...register("state")} 
                        disabled={submitting} 
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm">{errors.state.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input 
                        id="zipCode" 
                        {...register("zipCode")} 
                        disabled={submitting} 
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Replace the RadioGroup with a simple display of Cash on Delivery */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="hidden"
                      {...register("paymentMethod")}
                      value="cash"
                    />
                    <div className="flex items-center p-4 border rounded-md bg-muted/50 w-full">
                      <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with cash when your order is delivered
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>
          
          {/* Order Summary - 1/3 width on md screens */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="space-y-4">
                  {checkoutItems.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatPrice(item.productPrice || 0)}
                        </p>
                      </div>
                      <div className="font-medium">
                        {formatPrice((item.productPrice || 0) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Subtotal and Total */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>{formatPrice(checkoutTotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping</p>
                    <p>{formatPrice(0)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p>{formatPrice(checkoutTotal * 0.1)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatPrice(checkoutTotal + (checkoutTotal * 0.1))}</p>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <Button 
                  className="w-full mt-4" 
                  size="lg" 
                  onClick={handleSubmit(onSubmit)}
                  disabled={submitting || checkoutItems.length === 0}
                >
                  {submitting ? "Processing..." : "Place Order"}
                </Button>
                
                {/* If direct checkout, add a cart button */}
                {isDirect && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => router.push("/cart")}
                  >
                    View Cart
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}