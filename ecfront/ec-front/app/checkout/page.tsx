"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCart } from "@/lib/features/cart/cartSlice";
import axios from "@/lib/axiosConfig";
import { ChevronLeft } from "lucide-react";

// Schema for checkout form validation
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  paymentMethod: z.enum(["credit", "paypal", "cash"], {
    required_error: "Payment method is required",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Get cart items from Redux store
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector((state) => state.cart.total);
  const user = useAppSelector((state) => state.auth.user);
  
  // Check if cart is empty and redirect if needed
  if (cartItems.length === 0 && !orderPlaced) {
    // Only redirect on client-side
    if (typeof window !== 'undefined') {
      router.push("/products");
    }
  }
  
  // Form initialization
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || "",
      lastName: user?.name?.split(' ')[1] || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "credit",
    },
  });

  // Watch payment method to show appropriate fields
  const paymentMethod = watch("paymentMethod");

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    setSubmitting(true);
    
    try {
      // Create order payload
      const orderPayload = {
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        orderItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        })),
        paymentMethod: data.paymentMethod,
        totalAmount: cartTotal,
      };

      // In a real application, you would send this to your backend
      // For now, let's simulate a successful order
      // const response = await axios.post('/api/orders', orderPayload);
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random order number
      const generatedOrderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrderNumber);
      
      // Clear the cart
      dispatch(clearCart());
      
      // Set order as placed
      setOrderPlaced(true);
      
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
              
              <p className="text-center text-muted-foreground">
                A confirmation email has been sent to your email address.
              </p>
              
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12 mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <Button variant="ghost" onClick={() => router.back()} className="self-start mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...register("email")} 
                        disabled={submitting} 
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>
                    
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
                  {/* Use Controller for RadioGroup component */}
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit" id="payment-credit" />
                          <Label htmlFor="payment-credit">Credit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="payment-paypal" />
                          <Label htmlFor="payment-paypal">PayPal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="payment-cash" />
                          <Label htmlFor="payment-cash">Cash on Delivery</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>
                  )}
                  
                  {/* Credit Card Fields (simplified for demo purposes) */}
                  {paymentMethod === "credit" && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input 
                          id="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          disabled={submitting} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input 
                            id="expiryDate" 
                            placeholder="MM/YY" 
                            disabled={submitting} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            placeholder="123" 
                            disabled={submitting} 
                          />
                        </div>
                      </div>
                    </div>
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
                  {cartItems.map((item) => (
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
                    <p>{formatPrice(cartTotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping</p>
                    <p>{formatPrice(0)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p>{formatPrice(cartTotal * 0.1)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatPrice(cartTotal + (cartTotal * 0.1))}</p>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <Button 
                  className="w-full mt-4" 
                  size="lg" 
                  onClick={handleSubmit(onSubmit)}
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
