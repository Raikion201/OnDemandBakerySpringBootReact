"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { adminLogout } from "@/lib/features/admin/adminAuthSlice";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { adminUser } = useAppSelector((state) => state.adminAuth);

  const handleLogout = async () => {
    try {
      await dispatch(adminLogout()).unwrap();
      toast.success("Logged out successfully");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

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
            <Button variant="outline" onClick={() => router.push("/admin/users")}>
              Manage Users
            </Button>
            <Button onClick={() => router.push("/admin/users/create")}>
              Create User
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Rest of the dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total products</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
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
              <p className="text-center text-muted-foreground py-10">No recent activity</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">Add New Product</Button>
              <Button className="w-full justify-start" variant="outline">View Orders</Button>
              <Button className="w-full justify-start" variant="outline">System Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
