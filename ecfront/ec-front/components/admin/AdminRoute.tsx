"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosConfig";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if the user is authenticated as admin by calling a protected endpoint
        await axios.get("/api/admin/dashboard");
        setIsAdmin(true);
      } catch (error) {
        console.error("Not authenticated as admin:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Only render children if user is admin
  return isAdmin ? <>{children}</> : null;
}
