"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { checkAuth } from "@/lib/features/todos/authSlice";
import { toast } from "sonner";

export function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Check for error parameter
        const error = searchParams.get('error');
        if (error) {
          toast.error(`Authentication failed: ${error}`);
          router.push('/login');
          return;
        }

        // If no error, assume success and fetch user data
        // Use unwrap() here because we specifically want to handle failure
        const user = await dispatch(checkAuth()).unwrap();
        
        // Check if user is null (not authenticated)
        if (!user) {
          toast.error('Failed to complete authentication');
          router.push('/login');
          return;
        }
        
        // Successful login - redirect to intended destination
        const redirectTo = localStorage.getItem('previousUrl') || '/';
        localStorage.removeItem('previousUrl');
        
        toast.success('Successfully logged in!');
        router.push(redirectTo);
      } catch (error) {
        console.error('Error during OAuth callback processing:', error);
        toast.error('Failed to complete authentication');
        router.push('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [dispatch, router, searchParams]);

  if (isProcessing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4">Completing your login...</p>
      </div>
    );
  }

  return null;
}
