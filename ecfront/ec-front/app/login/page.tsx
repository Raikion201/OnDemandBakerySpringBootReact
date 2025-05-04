"use client";

import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation" 
import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // ...existing login logic...

      // After successful login, check for redirect
      const redirectUrl = localStorage.getItem("redirectAfterLogin")
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin") // Clean up
        router.push(redirectUrl)
      } else {
        // Default redirect if no specific redirect is saved
        router.push("/")
      }
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
          <LoginForm onSubmit={onSubmit} loading={loading} />
        </div>
      </div>
    </div>
  )
}
