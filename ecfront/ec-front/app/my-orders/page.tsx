"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosConfig";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppSelector } from "@/lib/hooks";
import { AlertTriangle, ArrowRight, CheckCircle, RefreshCcw } from "lucide-react";

interface LineItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
  productImageUrl: string;
}

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  userId: number;
  userName: string;
  items: LineItem[];
  totalAmount: number;
  paymentMethod: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/my-orders');
    }
  }, [user, router]);

  // Fetch user orders - improve error handling and add pagination support
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/my-orders');
      
      // Sort orders by date (most recent first)
      const sortedOrders = [...response.data].sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      
      setOrders(sortedOrders);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load your orders. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Open cancel dialog
  const openCancelDialog = (order: Order) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  // Cancel order - improved error handling
  const cancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setCancellingOrder(true);
      await axios.put(`/api/orders/${selectedOrder.id}/status`, { 
        status: 'CANCELLED'
      });
      
      // Update orders list with cancelled status
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'CANCELLED' } 
          : order
      ));
      
      // Update selected order if details dialog is open
      if (showOrderDetails) {
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' });
      }
      
      setCancelDialogOpen(false);
      
      // Show success message (you can use toast from your UI library)
      console.log('Order cancelled successfully');
      
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.error || 'Failed to cancel order. Please try again later.';
      setError(errorMessage);
    } finally {
      setCancellingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 hover:bg-yellow-500";
      case "PROCESSING":
        return "bg-blue-400 hover:bg-blue-500";
      case "SHIPPED":
        return "bg-purple-400 hover:bg-purple-500";
      case "DELIVERED":
        return "bg-green-400 hover:bg-green-500";
      case "CANCELLED":
        return "bg-red-400 hover:bg-red-500";
      default:
        return "bg-gray-400 hover:bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 mr-2" />;
      case "CANCELLED":
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case "PROCESSING":
      case "SHIPPED":
        return <RefreshCcw className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  // If not logged in, show nothing (redirect happens via useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12 max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button onClick={() => fetchOrders()} variant="outline">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center p-12">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <Card className="border-destructive max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => fetchOrders()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>No Orders Found</CardTitle>
              <CardDescription>You haven't placed any orders yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/products')}>
                Browse Products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle>Order #{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Placed on {format(new Date(order.orderDate), "MMMM dd, yyyy")}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Badge className={`${getStatusColor(order.status)} text-white flex items-center`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-medium mb-1">Shipping Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingFirstName} {order.shippingLastName}<br />
                        {order.shippingAddress}<br />
                        {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Payment Method</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.paymentMethod}
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-end md:self-end">
                      <Button 
                        variant="outline" 
                        onClick={() => viewOrderDetails(order)}
                      >
                        View Details
                      </Button>
                      {order.status === "PENDING" && (
                        <Button 
                          variant="destructive" 
                          onClick={() => openCancelDialog(order)}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Order placed on{" "}
                {selectedOrder &&
                  format(new Date(selectedOrder.orderDate), "MMMM dd, yyyy HH:mm")}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Order Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Order Number:</span>
                      <span>{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Date:</span>
                      <span>{format(new Date(selectedOrder.orderDate), "PPpp")}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Payment Method:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Total Amount:</span>
                      <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Shipping Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Name:</span>
                      <span>
                        {selectedOrder.shippingFirstName || 'N/A'}{" "}
                        {selectedOrder.shippingLastName || ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedOrder.shippingPhone || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Address:</span>
                      <span>{selectedOrder.shippingAddress || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">City:</span>
                      <span>{selectedOrder.shippingCity || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">State:</span>
                      <span>{selectedOrder.shippingState || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Zip Code:</span>
                      <span>{selectedOrder.shippingZipCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="flex items-center gap-3">
                            {item.productImageUrl && (
                              <img 
                                src={`http://localhost:8080${item.productImageUrl}`}
                                alt={item.productName}
                                className="h-10 w-10 object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.productName}</div>
                            </div>
                          </TableCell>
                          <TableCell>${item.productPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${item.lineTotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {selectedOrder.status === "PENDING" && (
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setShowOrderDetails(false);
                        openCancelDialog(selectedOrder);
                      }}
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Order Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel order #{selectedOrder?.orderNumber}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setCancelDialogOpen(false)}
              >
                No, Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={cancelOrder} 
                disabled={cancellingOrder}
              >
                {cancellingOrder ? 'Cancelling...' : 'Yes, Cancel Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
