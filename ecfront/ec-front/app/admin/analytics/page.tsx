"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllAnalytics } from "@/lib/features/analytics/analyticsSlice";
import { SimpleChart } from "@/components/analytics/SimpleChart";
import { ChartErrorBoundary } from "@/components/analytics/ChartErrorBoundary";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Admin role checking utility
const hasAdminRole = (roles: string[]): boolean => {
  const adminRoles = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_OWNER'];
  return roles.some(role => adminRoles.includes(role));
};

interface RevenueAnalytics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  deliveredOrders?: number;
  revenueByStatus: Record<string, number>;
}

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface OrderStats {
  totalOrders: number;
  orderCountByStatus: Record<string, number>;
  conversionRate: number;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { revenueAnalytics, dailyRevenue, monthlyRevenue, orderStats, loading, error } = useAppSelector(
    (state) => state.analytics
  );
  const { adminUser, roles } = useAppSelector((state) => state.adminAuth);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "12m">("7d");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const fetchAnalyticsData = () => {
    const days = selectedPeriod === "7d" ? 7 : 30;
    const months = 12;
    dispatch(fetchAllAnalytics({ days, months }));
  };

  useEffect(() => {
    // Check if user has admin role before fetching analytics
    if (adminUser && hasAdminRole(roles)) {
      fetchAnalyticsData();
    } else {
      console.warn('User does not have admin privileges for analytics');
    }
  }, [selectedPeriod, dispatch, adminUser, roles]);

  // Log analytics state changes
  useEffect(() => {
    console.log('🔍 Analytics State Update:', {
      loading,
      error,
      revenueAnalytics,
      dailyRevenue,
      monthlyRevenue,
      orderStats,
      selectedPeriod,
      adminUser: adminUser?.username,
      roles
    });
  }, [loading, error, revenueAnalytics, dailyRevenue, monthlyRevenue, orderStats, selectedPeriod, adminUser, roles]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Convert data for charts with error handling
  const getChartData = () => {
    try {
      let chartData;
      
      if (selectedPeriod === "12m") {
        chartData = (monthlyRevenue || []).map(item => ({
          label: item?.month?.split('-')[1] || 'Unknown',
          value: typeof item?.revenue === 'number' ? item.revenue : 0,
          month: item?.month || ''
        }));
        console.log('📊 Monthly Revenue Data:', {
          rawData: monthlyRevenue,
          chartData: chartData,
          selectedPeriod
        });
      } else {
        chartData = (dailyRevenue || []).map(item => ({
          label: item?.date?.split('-')[2] || 'Unknown',
          value: typeof item?.revenue === 'number' ? item.revenue : 0,
          date: item?.date || ''
        }));
        console.log('📊 Daily Revenue Data:', {
          rawData: dailyRevenue,
          chartData: chartData,
          selectedPeriod
        });
      }
      
      return chartData;
    } catch (error) {
      console.error('Error processing chart data:', error);
      return [];
    }
  };

  const getRevenueByStatusData = () => {
    try {
      if (!revenueAnalytics || !revenueAnalytics.revenueByStatus) {
        console.log('📊 Revenue by Status Data: No revenue analytics available');
        return [];
      }
      
      const statusData = Object.entries(revenueAnalytics.revenueByStatus).map(([status, value]) => ({
        label: status || 'Unknown',
        value: typeof value === 'number' ? value : 0
      }));
      
      console.log('📊 Revenue by Status Data:', {
        rawRevenueAnalytics: revenueAnalytics,
        revenueByStatus: revenueAnalytics.revenueByStatus,
        chartData: statusData
      });
      
      return statusData;
    } catch (error) {
      console.error('Error processing revenue by status data:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            {error.includes('401') || error.includes('Unauthorized') ? (
              <div className="mb-4">
                <p className="text-sm text-orange-600">
                  You may not have admin privileges to view analytics.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/admin/login")}
                  className="mt-2"
                >
                  Login as Admin
                </Button>
              </div>
            ) : (
              <Button onClick={fetchAnalyticsData}>Retry</Button>
            )}
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Revenue and business insights</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-2">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("7d")}
                size="sm"
              >
                Last 7 Days
              </Button>
              <Button
                variant={selectedPeriod === "12m" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("12m")}
                size="sm"
              >
                Last 12 Months
              </Button>
            </div>
            <Button variant="outline" onClick={() => router.push("/admin/dashboard")} size="sm">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueAnalytics ? formatCurrency(revenueAnalytics.totalRevenue) : "$0"}
              </div>
              <p className="text-xs text-muted-foreground">
                From delivered orders only
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueAnalytics ? formatCurrency(revenueAnalytics.averageOrderValue) : "$0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueAnalytics ? revenueAnalytics.totalOrders.toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Total orders: {revenueAnalytics?.totalOrders || 0} | Delivered: {(revenueAnalytics as any)?.deliveredOrders ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orderStats ? `${orderStats.conversionRate.toFixed(1)}%` : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartErrorBoundary>
            <SimpleChart
              data={getChartData()}
              title={`${selectedPeriod === "12m" ? "Monthly" : "Daily"} Revenue Trend`}
              type={chartType}
              height={300}
              color="#3B82F6"
            />
          </ChartErrorBoundary>

          <ChartErrorBoundary>
            <SimpleChart
              data={getRevenueByStatusData()}
              title="Revenue by Order Status"
              type="pie"
              height={300}
            />
          </ChartErrorBoundary>
        </div>

        {/* Debug Information */}
        {getChartData().length === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-orange-600">No Revenue Data Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>No delivered orders found for the selected period ({selectedPeriod}).</p>
                <p>To see revenue data:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Create some orders in the system</li>
                  <li>Update order status to "DELIVERED" in the orders page</li>
                  <li>Only delivered orders count as revenue</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Current data:</p>
                  <p>Total Orders: {revenueAnalytics?.totalOrders || 0}</p>
                  <p>Delivered Orders: {(revenueAnalytics as any)?.deliveredOrders ?? 0}</p>
                  <p>Revenue Data Points: {getChartData().length}</p>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push("/admin/orders")}
                    >
                      Go to Orders Page
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {orderStats && (
                <div className="space-y-4">
                  {Object.entries(orderStats.orderCountByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {status}
                        </Badge>
                        <span>{count} orders</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((count / orderStats.totalOrders) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                onClick={() => router.push("/admin/orders")}
              >
                View All Orders
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
                onClick={fetchAnalyticsData}
              >
                Refresh Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
