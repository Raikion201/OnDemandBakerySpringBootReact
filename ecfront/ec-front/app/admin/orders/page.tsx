"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchOrders,
  updateOrderStatus,
} from "@/lib/features/orders/orderSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector(
    (state) => state.orders
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (filter === "ALL") {
      dispatch(fetchOrders());
    } else {
      dispatch(fetchOrders(filter));
    }
  }, [dispatch, filter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await dispatch(
        updateOrderStatus({ id: orderId, status: newStatus })
      ).unwrap();

      // Update selected order if it's currently displayed
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const viewOrderDetails = (order: Order) => {
    // Log to debug the order data and check if shipping fields are present
    console.log("Order details:", order);
    setSelectedOrder(order);
    setShowOrderDetails(true);
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

  return (
    <div className="container mx-auto p-6 max-w-[1200px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <div className="flex items-center space-x-2">
          <span>Filter by Status:</span>
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              dispatch(fetchOrders(filter !== "ALL" ? filter : undefined))
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage and view all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {loading ? (
            <div className="text-center p-4">Loading orders...</div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center p-4">No orders found</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.orderDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {order.shippingFirstName} {order.shippingLastName}
                      </TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="flex flex-col md:flex-row gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                            className="w-full md:w-[130px] h-[30px]"
                          >
                            View Details
                          </Button>
                          <Select
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value)
                            }
                            defaultValue={order.status}
                          >
                            <SelectTrigger className="w-full md:w-[130px] h-[30px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PROCESSING">Processing</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="min-w-[50vw] w-full">
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
                    <span className="font-medium">ID:</span>
                    <span>{selectedOrder.id}</span>
                  </div>
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
                  <div className="grid grid-cols-2">
                    <span className="font-medium">User ID:</span>
                    <span>{selectedOrder.userId}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">User Name:</span>
                    <span>{selectedOrder.userName}</span>
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
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-gray-500">
                              ID: {item.productId}
                            </div>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
