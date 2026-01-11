"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartComponent } from "@/components/cart/CartComponent";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, logoutAsync, checkAuth } from "@/lib/features/todos/authSlice";
import { useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // Update useEffect to not force redirects on auth check failures
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // Only attempt to check auth if we're not on auth-related pages
        if (!['/login', '/sign-up', '/admin/login'].includes(pathname)) {
          // No need to unwrap() here - it will cause redirect on rejection
          // Just dispatch the action and let the reducer handle the state
          dispatch(checkAuth());
        }
      } catch (error) {
        // Don't need to do anything on error
        console.log("Auth check completed");
      }
    };

    checkUserAuth();
  }, [dispatch, pathname]);

  const handleAuthNav = (path: string) => {
    if (!['/login','/sign-up'].includes(pathname)) {
      localStorage.setItem("previousUrl", pathname);
    }
    router.push(path);
  };

  // add logout handler
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint through the async thunk
      await dispatch(logoutAsync()).unwrap();
      
      // Manually update auth state
      dispatch(logout());
      
      // Force delete ALL auth cookies from frontend
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      document.cookie = 'JSESSIONID=; Max-Age=0; path=/;'; // Spring Security session
      
      // Small delay to ensure cookies are cleared before reload
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Error logging out:', error);
      // Still logout locally even if API fails
      dispatch(logout());
      
      // Force delete all cookies even on error
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      document.cookie = 'JSESSIONID=; Max-Age=0; path=/;';
      
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 px-32 justify-between w-full">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">BakeDelights</div>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About Us
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-4">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <span className="sr-only">Search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </Button>
            </Link>
            <CartComponent variant="icon" />
            {user && <NotificationBell />}
          </div>
          <div className="flex items-center gap-4">
            { user ? (
              <div className="relative inline-block group">
                <span className="cursor-pointer">Welcome, {user.name || user.username}</span>
                <div className="absolute left-0 mt-2 w-48 bg-card text-card-foreground border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-muted/50">Manage Account</Link>
                  <Link href="/my-orders" className="block px-4 py-2 hover:bg-muted/50">Manage Orders</Link>
                  {/* replace link with button to invoke logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => handleAuthNav("/login")}>
                  Login
                </Button>
                <Button onClick={() => handleAuthNav("/sign-up")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
