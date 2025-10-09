"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { Toaster } from "sonner";
import { Chatbot } from "@/components/chat/Chatbot";
import { NotificationProvider } from "@/lib/features/notifications/NotificationProvider";
import { ToastNotification } from "@/components/notifications/ToastNotification";
// import { useState, useEffect } from "react";
// import { Loader2Icon } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const [isLoading, setIsLoading] = useState(true);
  // const handleLoading = () => {
  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   window.addEventListener("load", handleLoading);
  //   return () => window.removeEventListener("load", handleLoading);
  // }, []);

  // if (isLoading) {
  //   return (
  //     <html lang="en" suppressHydrationWarning>
  //       <body
  //         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  //       >
  //         <div className="fixed inset-0 bg-black/20 backdrop-blur-sm">
  //           <div className="flex flex-col items-center justify-center min-w-screen min-h-screen">
  //             <Loader2Icon className="w-[10vw] h-[10vw] animate-spin min-w-[50px] min-h-[50px] max-w-[150px] max-h-[150px] text-primary z-50" />
  //           </div>
  //         </div>
  //       </body>
  //     </html>
  //   );
  // }
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <NotificationProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              expand
              duration={3000}
            />
            <ToastNotification />
            <Chatbot />
          </NotificationProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
