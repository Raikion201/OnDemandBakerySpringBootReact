"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { searchProducts } from "@/lib/features/products/productSlice";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft } from "lucide-react";

export function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { products, loading, error } = useAppSelector((state) => state.products);
    const [searchQuery, setSearchQuery] = useState(query);

    useEffect(() => {
        if (query) {
            dispatch(searchProducts(query));
        }
    }, [dispatch, query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="container px-4 py-8 md:px-6 md:py-12">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.push("/products")}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>

                <h1 className="text-3xl font-bold tracking-tight mt-4 mb-2">
                    {query ? `Search Results for "${query}"` : "Search Products"}
                </h1>

                <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-6">
                    <Input
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="flex justify-center py-20">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">
                        {query ? `No products found for "${query}"` : "Search for products to get started"}
                    </p>
                </div>
            )}
        </div>
    );
}
