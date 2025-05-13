"use client";

import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react" // Add Suspense import
import Link from "next/link"
import { useAppSelector } from "@/lib/hooks";

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const user = useAppSelector((state) => state.auth.user);

  // Check if the user is already logged in and handle redirects
  useEffect(() => {
    if (user) {
      // If there's a redirect URL stored, use it
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin'); // Clean up
        router.push(redirectUrl);
      } else {
        // Default redirect if no specific redirect is saved
        router.push('/');
      }
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      // The actual login logic is handled in the LoginForm component
      // After login is successful, the useEffect above will handle the redirect
    } catch (error) {
      // ...existing error handling...
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo Section - Positioned in top left */}
      <div className="p-6 md:p-10">
        <Link href="/" className="inline-block">
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-primary">BakeDelights</div>
            <p className="text-sm text-muted-foreground mt-1">Fresh Bakery Products</p>
          </div>
        </Link>
      </div>
      
      {/* Center the login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Suspense fallback={<div className="p-4 text-center">Loading login form...</div>}>
            <LoginForm onSubmit={onSubmit} loading={loading} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}