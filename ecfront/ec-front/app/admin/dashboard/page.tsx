"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  adminLogout,
  checkAdminAuth,
} from "@/lib/features/admin/adminAuthSlice";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosConfig";

// Define interface for dashboard stats
interface DashboardStats {
  userCount: number;
  productCount: number;
  orderCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { adminUser, loading } = useAppSelector((state) => state.adminAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
  });

  const fetchDashboardData = async () => {
    try {
      // Fetch user count
      const usersResponse = await axios.get("/api/admin/users");
      const userCount = usersResponse.data.length;

      // Fetch product count
      const productsResponse = await axios.get("/api/products");
      const productCount = productsResponse.data.length;

      // Fetch order count from our order controller
      const ordersResponse = await axios.get("/api/orders");
      const orderCount = ordersResponse.data.length;

      setStats({
        userCount,
        productCount,
        orderCount,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    // Check authentication status and fetch admin user data on page load
    const checkAuth = async () => {
      try {
        await dispatch(checkAdminAuth()).unwrap();
        await fetchDashboardData();
        setIsLoading(false);
      } catch (error) {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [dispatch, router]);

  const handleLogout = async () => {
    try {
      await dispatch(adminLogout()).unwrap();
      router.push("/admin/login");
    } catch (error) {
      console.error("Failed to logout: ", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {adminUser && (
              <p className="text-muted-foreground">
                Welcome, {adminUser.name || adminUser.username}
              </p>
            )}
          </div>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              Manage Users
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Manage Products
            </Button>
            <Button onClick={() => router.push("/admin/users/create")}>
              Create User
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard content with real data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.userCount}</p>
              <p className="text-sm text-muted-foreground">Total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.productCount}</p>
              <p className="text-sm text-muted-foreground">Total products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.orderCount}</p>
              <p className="text-sm text-muted-foreground">Total orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-10">
                No recent activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/products/create")}
              >
                Add New Product
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/products")}
              >
                Manage Products
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/orders")}
              >
                View Orders
              </Button>
              <Button className="w-full justify-start" variant="outline">
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
