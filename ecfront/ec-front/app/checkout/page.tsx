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
import { useAppSelector } from "@/lib/hooks";
import { ChevronLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod } from "@/types/payment";
import { useCheckoutFacade } from "@/hooks/useCheckoutFacade";
import { CheckoutRequest } from "@/lib/facades/CheckoutFacade";

// Update the checkout schema to remove email field
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  paymentMethod: z.string(),
  cardholderName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Use Checkout Facade
  const {
    processCheckout,
    calculateTotal,
    formatPrice,
    getPaymentMethods,
    isProcessing
  } = useCheckoutFacade();

  // Redux state
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector((state) => state.cart.total);
  const user = useAppSelector((state) => state.auth.user);
  const directCheckoutItem = useAppSelector((state) => state.cart.directCheckoutItem);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "cash",
    },
  });

  // Calculate checkout data
  const isDirect = !!directCheckoutItem;
  const checkoutItems = isDirect ? [directCheckoutItem] : cartItems;
  const checkoutSubtotal = isDirect
    ? (directCheckoutItem.productPrice || 0) * directCheckoutItem.quantity
    : cartTotal;

  // Use facade to calculate total
  const checkoutTotal = calculateTotal(checkoutSubtotal);

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
    if (!orderPlaced) {
      if ((isDirect && !directCheckoutItem) || (!isDirect && cartItems.length === 0)) {
        router.push("/products");
      }
    }
  }, [isDirect, directCheckoutItem, cartItems, orderPlaced, router]);

  // Fetch payment methods using facade
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setPaymentLoading(true);
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- Sửa lại chỉ gọi 1 lần khi mount

  // Simplified form submission using Facade
  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      // Prepare checkout request using facade interface
      const checkoutRequest: CheckoutRequest = {
        items: checkoutItems.map(item => ({
          productId: item.productId,
          productName: item.productName || "",  // Provide a default empty string if undefined
          productPrice: item.productPrice || 0,
          quantity: item.quantity
        })),
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: user?.email || '',
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        paymentInfo: {
          method: data.paymentMethod,
          details: data.paymentMethod === 'credit_card' ? {
            cardholderName: data.cardholderName,
            cardNumber: data.cardNumber,
            expiryDate: data.expiryDate,
            cvv: data.cvv
          } : undefined
        },
        totalAmount: checkoutTotal,
        isDirect: isDirect
      };

      // Process checkout using facade - single method call!
      const result = await processCheckout(checkoutRequest);

      if (result.success) {
        setOrderPlaced(true);
        setOrderNumber(result.orderNumber || 'N/A');
      }
      // Error handling is done automatically by facade

    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  // Auth check UI
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

  // Order confirmation UI
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

  // Main checkout UI - much cleaner now!
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
          {/* Checkout Form */}
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
                        disabled={isProcessing}
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
                        disabled={isProcessing}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      disabled={isProcessing}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address - similar structure... */}
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
                      disabled={isProcessing}
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
                        disabled={isProcessing}
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
                        disabled={isProcessing}
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
                        disabled={isProcessing}
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method - similar structure... */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentLoading ? (
                    <div className="py-2">Đang tải phương thức thanh toán...</div>
                  ) : (
                    <RadioGroup
                      defaultValue="cash"
                      onValueChange={(value: string) => setValue("paymentMethod", value)}
                      disabled={isProcessing}
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                          <Label htmlFor={`payment-${method.id}`} className="flex flex-1 items-center p-4 border rounded-md bg-muted/50">
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Thẻ tín dụng - Hiển thị khi chọn credit_card */}
                  {watch("paymentMethod") === "credit_card" && (
                    <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/50">
                      <div>
                        <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
                        <Input
                          id="cardholderName"
                          {...register("cardholderName", {
                            required: watch("paymentMethod") === "credit_card" ? "Tên chủ thẻ là bắt buộc" : false
                          })}
                          disabled={isProcessing}
                        />
                        {errors.cardholderName && (
                          <p className="text-red-500 text-sm">{errors.cardholderName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Số thẻ</Label>
                        <Input
                          id="cardNumber"
                          {...register("cardNumber", {
                            required: watch("paymentMethod") === "credit_card" ? "Số thẻ là bắt buộc" : false,
                            pattern: {
                              value: /^\d{16}$/,
                              message: "Vui lòng nhập số thẻ 16 chữ số"
                            }
                          })}
                          disabled={isProcessing}
                        />
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Ngày hết hạn (MM/YY)</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            {...register("expiryDate", {
                              required: watch("paymentMethod") === "credit_card" ? "Ngày hết hạn là bắt buộc" : false,
                              pattern: {
                                value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                                message: "Vui lòng nhập định dạng MM/YY"
                              }
                            })}
                            disabled={isProcessing}
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            {...register("cvv", {
                              required: watch("paymentMethod") === "credit_card" ? "CVV là bắt buộc" : false,
                              pattern: {
                                value: /^\d{3,4}$/,
                                message: "CVV phải có 3-4 chữ số"
                              }
                            })}
                            disabled={isProcessing}
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm">{errors.cvv.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chuyển khoản ngân hàng - Hiển thị khi chọn bank_transfer */}
                  {watch("paymentMethod") === "bank_transfer" && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/50">
                      <div className="space-y-2">
                        <p className="font-medium">Thông tin tài khoản ngân hàng</p>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-sm font-medium">Ngân hàng:</p>
                          <p className="text-sm">Vietcombank</p>
                          <p className="text-sm font-medium">Số tài khoản:</p>
                          <p className="text-sm">1234567890</p>
                          <p className="text-sm font-medium">Chủ tài khoản:</p>
                          <p className="text-sm">CÔNG TY BAKERY</p>
                          <p className="text-sm font-medium">Nội dung:</p>
                          <p className="text-sm">Thanh toán đơn hàng [Số điện thoại]</p>
                        </div>
                        <p className="text-sm text-amber-600 mt-2">
                          *Lưu ý: Đơn hàng sẽ được xử lý sau khi thanh toán được xác nhận
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
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
                    <p>{formatPrice(checkoutSubtotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping</p>
                    <p>{formatPrice(0)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p>{formatPrice(checkoutSubtotal * 0.1)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatPrice(checkoutTotal)}</p>
                  </div>
                </div>

                {/* Simplified Place Order Button */}
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isProcessing || checkoutItems.length === 0}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>

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