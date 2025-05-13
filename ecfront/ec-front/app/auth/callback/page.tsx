"use client";

import { Suspense } from "react";
import { GoogleAuthCallback } from "@/components/auth/GoogleAuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Processing authentication...</div>}>
      <GoogleAuthCallback />
    </Suspense>
  );
}