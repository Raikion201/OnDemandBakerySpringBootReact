'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchOrderDetails, clearCurrentOrder } from '@/lib/features/orders/orderSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2Icon, ArrowLeft, Package, Clock, TruckIcon, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentOrder, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(orderId));

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  const getOrderStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'PREPARING': return 3;
      case 'READY_FOR_DELIVERY': return 4;
      case 'OUT_FOR_DELIVERY': return 5;
      case 'DELIVERED': return 6;
      default: return 0;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED': return 'outline';
      case 'PREPARING': return 'default';
      case 'READY_FOR_DELIVERY': return 'default';
      case 'OUT_FOR_DELIVERY': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!currentOrder) {
    return <div className="text-center p-4">Order not found</div>;
  }

  const statusStep = getOrderStatusStep(currentOrder.status);
  const isCancelled = currentOrder.status === 'CANCELLED';

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Order #{currentOrder.id}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Order Summary</span>
                <Badge variant={getStatusBadgeVariant(currentOrder.status)}>
                  {currentOrder.status.replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{formatDate(currentOrder.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Address:</span>
                  <span>{currentOrder.deliveryAddress || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Phone:</span>
                  <span>{currentOrder.contactPhone || 'N/A'}</span>
                </div>
                <Separator className="my-4" />
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-2">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <span className="font-medium">{item.productName}</span>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>${item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>${currentOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Tracking Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <div className="p-4 bg-red-50 rounded-md text-center">
                <div className="text-red-600 font-medium mb-2">Order Cancelled</div>
                {currentOrder.cancelledTime && (
                  <div className="text-sm text-muted-foreground">
                    {formatDate(currentOrder.cancelledTime)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 relative">
                {/* Progress bar */}
                <div className="absolute left-4 top-1 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                
                {/* Order placed */}
                <div className="relative z-10 flex items-center">
                  <div className={`rounded-full p-1 ${statusStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                    <Clock size={16} />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Order Placed</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(currentOrder.orderDate)}
                    </div>
                  </div>
                </div>
                
                {/* Order confirmed */}
                <div className="relative z-10 flex items-center">
                  <div className={`rounded-full p-1 ${statusStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                    <CheckCircle size={16} />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Order Confirmed</div>
                    {currentOrder.confirmedTime ? (
                      <div className="text-sm text-muted-foreground">
                        {formatDate(currentOrder.confirmedTime)}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Pending</div>
                    )}
                  </div>
                </div>
                
                {/* Preparing */}
                <div className="relative z-10 flex items-center">
                  <div className={`rounded-full p-1 ${statusStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                    <Package size={16} />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Preparing Your Order</div>
                    {currentOrder.preparingTime ? (
                      <div className="text-sm text-muted-foreground">
                        {formatDate(currentOrder.preparingTime)}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Pending</div>
                    )}
                  </div>
                </div>
                
                {/* Out for delivery */}
                <div className="relative z-10 flex items-center">
                  <div className={`rounded-full p-1 ${statusStep >= 5 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                    <TruckIcon size={16} />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Out for Delivery</div>
                    {currentOrder.outForDeliveryTime ? (
                      <div className="text-sm text-muted-foreground">
                        {formatDate(currentOrder.outForDeliveryTime)}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Pending</div>
                    )}
                  </div>
                </div>
                
                {/* Delivered */}
                <div className="relative z-10 flex items-center">
                  <div className={`rounded-full p-1 ${statusStep >= 6 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                    <CheckCircle size={16} />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Delivered</div>
                    {currentOrder.deliveredTime ? (
                      <div className="text-sm text-muted-foreground">
                        {formatDate(currentOrder.deliveredTime)}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Pending</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}