"use client";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { checkAuth } from "@/lib/features/todos/authSlice";

export function GoogleLoginButton() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Check if we've been redirected back from Google OAuth
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (token) {
      // If we have a token in the URL, we just completed OAuth login
      // Dispatch checkAuth to fetch the user info and update state
      dispatch(checkAuth()).unwrap()
        .then(() => {
          // Clear the URL parameters to avoid issues on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          console.error("Error checking auth after Google login:", error);
        });
    }
    
    if (error) {
      console.error("Google OAuth error:", error);
      // You could show an error toast here
    }
  }, [searchParams, dispatch]);

  const handleGoogleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const googleAuthUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || '/oauth2/authorization/google';
    
    // Save current URL as redirect target after login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!['/login', '/sign-up'].includes(currentPath)) {
        localStorage.setItem("previousUrl", currentPath);
      }
    }
    
    // Construct the full URL - if API_BASE_URL is /api (for nginx), we need to use window.location.origin
    const baseUrl = apiBaseUrl.startsWith('http') 
      ? apiBaseUrl 
      : `${window.location.origin}${apiBaseUrl}`;
      
    window.location.href = `${baseUrl}${googleAuthUrl}`;
  };

  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2" 
      onClick={handleGoogleLogin}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </Button>
  );
}