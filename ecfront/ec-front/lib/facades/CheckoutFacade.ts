import axios from '@/lib/axiosConfig';
import { AppDispatch } from '@/lib/store';
import { clearCart, clearDirectCheckoutItem } from '@/lib/features/cart/cartSlice';
import { toast } from '@/hooks/use-toast';

export interface CheckoutItem {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PaymentInfo {
  method: string;
  details?: {
    cardholderName?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    accountName?: string;
    transferReference?: string;
  };
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  customerInfo: CustomerInfo;
  paymentInfo: PaymentInfo;
  totalAmount: number;
  isDirect: boolean;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message: string;
  error?: string;
}

export class CheckoutFacade {
  private static instance: CheckoutFacade;

  private constructor() { }

  static getInstance(): CheckoutFacade {
    if (!CheckoutFacade.instance) {
      CheckoutFacade.instance = new CheckoutFacade();
    }
    return CheckoutFacade.instance;
  }

  /**
   * Main checkout method that handles the entire checkout process
   * This is the single entry point for all checkout operations
   */
  async processCheckout(
    request: CheckoutRequest,
    dispatch: AppDispatch
  ): Promise<CheckoutResult> {
    try {
      // Step 1: Validate checkout data
      this.validateCheckoutRequest(request);

      // Step 2: Show processing notification
      this.showProcessingNotification();

      // Step 3: Prepare payment details based on method
      const paymentDetails = this.preparePaymentDetails(request.paymentInfo, request.customerInfo);

      // Step 4: Create checkout request for API
      const checkoutRequest = this.buildCheckoutRequest(request, paymentDetails);

      // Step 5: Process payment and create order
      const response = await this.submitOrder(checkoutRequest);

      // Step 6: Handle successful response
      if (response.status === 201) {
        const result = await this.handleSuccessfulCheckout(response.data, request.isDirect, dispatch);
        return result;
      } else {
        throw new Error('Unexpected response status');
      }

    } catch (error: any) {
      // Step 7: Handle errors
      return this.handleCheckoutError(error);
    }
  }

  /**
   * Validate checkout request data
   */
  private validateCheckoutRequest(request: CheckoutRequest): void {
    if (!request.items || request.items.length === 0) {
      throw new Error('No items to checkout');
    }

    if (!request.customerInfo.firstName || !request.customerInfo.lastName) {
      throw new Error('Customer name is required');
    }

    if (!request.customerInfo.phone || request.customerInfo.phone.length < 10) {
      throw new Error('Valid phone number is required');
    }

    if (!request.customerInfo.address) {
      throw new Error('Address is required');
    }

    if (!request.paymentInfo.method) {
      throw new Error('Payment method is required');
    }

    // Validate credit card details if credit card is selected
    if (request.paymentInfo.method === 'credit_card') {
      const details = request.paymentInfo.details;
      if (!details?.cardholderName || !details?.cardNumber || !details?.expiryDate || !details?.cvv) {
        throw new Error('Complete credit card information is required');
      }
    }
  }

  /**
   * Show processing notification to user
   */
  private showProcessingNotification(): void {
    toast({
      title: "Processing Order",
      description: "Please wait while we process your order...",
    });
  }

  /**
   * Prepare payment details based on payment method
   */
  private preparePaymentDetails(paymentInfo: PaymentInfo, customerInfo: CustomerInfo): any {
    switch (paymentInfo.method) {
      case 'credit_card':
        return {
          cardholderName: paymentInfo.details?.cardholderName,
          cardNumber: paymentInfo.details?.cardNumber,
          expiryDate: paymentInfo.details?.expiryDate,
          cvv: paymentInfo.details?.cvv
        };

      case 'bank_transfer':
        return {
          accountName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          transferReference: `ORDER${Date.now().toString().slice(-6)}`
        };

      case 'cash':
      default:
        return {};
    }
  }

  /**
   * Build the complete checkout request for API
   */
  private buildCheckoutRequest(request: CheckoutRequest, paymentDetails: any): any {
    return {
      customerInfo: {
        firstName: request.customerInfo.firstName,
        lastName: request.customerInfo.lastName,
        email: request.customerInfo.email,
        phone: request.customerInfo.phone,
        address: request.customerInfo.address,
        city: request.customerInfo.city,
        state: request.customerInfo.state,
        zipCode: request.customerInfo.zipCode,
      },
      orderItems: request.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.productPrice
      })),
      paymentMethod: request.paymentInfo.method,
      paymentDetails,
      totalAmount: request.totalAmount,
      directPurchase: request.isDirect
    };
  }

  /**
   * Submit order to backend API
   */
  private async submitOrder(checkoutRequest: any): Promise<any> {
    return await axios.post('/api/orders/checkout', checkoutRequest);
  }

  /**
   * Handle successful checkout
   */
  private async handleSuccessfulCheckout(
    responseData: any,
    isDirect: boolean,
    dispatch: AppDispatch
  ): Promise<CheckoutResult> {
    // Clear appropriate cart
    if (isDirect) {
      dispatch(clearDirectCheckoutItem());
    } else {
      dispatch(clearCart());
    }

    // Show success notification
    toast({
      title: "Order Placed Successfully!",
      description: `Your order ${responseData.orderNumber || 'N/A'} has been placed successfully.`,
    });

    return {
      success: true,
      orderId: responseData.id?.toString(),
      orderNumber: responseData.orderNumber,
      message: "Order placed successfully"
    };
  }

  /**
   * Handle checkout errors
   */
  private handleCheckoutError(error: any): CheckoutResult {
    console.error('Checkout error:', error);

    let errorMessage = "Failed to place order. Please try again.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show error notification
    toast({
      variant: "destructive",
      title: "Checkout Failed",
      description: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
      message: "Checkout failed"
    };
  }

  /**
   * Calculate total amount including tax and shipping
   */
  calculateTotal(subtotal: number, taxRate: number = 0.1, shipping: number = 0): number {
    return subtotal + (subtotal * taxRate) + shipping;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  /**
   * Validate payment method
   */
  isValidPaymentMethod(method: string): boolean {
    const validMethods = ['cash', 'credit_card', 'bank_transfer', 'paypal'];
    return validMethods.includes(method);
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await axios.get('/api/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      // Fallback to hardcoded methods if API fails
      return [
        {
          id: "cash",
          name: "Thanh toán khi nhận hàng",
          description: "Thanh toán bằng tiền mặt khi nhận hàng",
          isActive: true
        },
        {
          id: "credit_card",
          name: "Thẻ tín dụng/Ghi nợ",
          description: "Thanh toán an toàn với thẻ tín dụng/ghi nợ",
          isActive: true
        },
        {
          id: "bank_transfer",
          name: "Chuyển khoản ngân hàng",
          description: "Chuyển khoản trực tiếp đến tài khoản ngân hàng của chúng tôi",
          isActive: true
        }
      ];
    }
  }
}