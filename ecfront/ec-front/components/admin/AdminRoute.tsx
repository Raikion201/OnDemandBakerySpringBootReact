"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAdminAuth } from "@/lib/features/admin/adminAuthSlice";

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function AdminRoute({ children, requiredRoles = [] }: AdminRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, adminUser, roles, loading } = useAppSelector(
    (state) => state.adminAuth
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(checkAdminAuth()).unwrap();
        setChecking(false);
      } catch (error) {
        router.push("/admin/login");
      }
    };

    if (!isAuthenticated) {
      verifyAuth();
    } else {
      setChecking(false);
    }
  }, [dispatch, isAuthenticated, router]);

  // Check if the user has the required roles
  const hasRequiredRoles = 
    requiredRoles.length === 0 || // No specific roles required
    requiredRoles.some(role => roles.includes(role)); // Has at least one of the required roles

  if (checking || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  if (!hasRequiredRoles) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="mt-2">You don't have permission to access this page.</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
            onClick={() => router.push("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
