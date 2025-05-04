"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResetPasswordContent } from "./ResetPasswordContent";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={
          <div className="flex justify-center items-center h-[50vh]">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}