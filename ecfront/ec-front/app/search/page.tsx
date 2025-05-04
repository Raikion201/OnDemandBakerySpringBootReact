"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { searchProducts } from "@/lib/features/products/productSlice";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchContent } from "./SearchContent";

export default function SearchPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <Suspense fallback={
                    <div className="flex justify-center items-center h-[50vh]">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }>
                    <SearchContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}