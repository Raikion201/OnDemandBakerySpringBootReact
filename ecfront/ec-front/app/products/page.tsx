"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchFilteredProducts, ProductFilterParams } from "@/lib/features/products/productSlice";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

export default function ProductsPage() {
    const dispatch = useAppDispatch();
    const { filteredProducts, loading, error } = useAppSelector((state) => state.products);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("name_asc");
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState<ProductFilterParams>({});

    const pageSize = 8;

    useEffect(() => {
        // Fetch initial products
        dispatch(fetchFilteredProducts({ page: 0, size: pageSize }));
    }, [dispatch]);

    useEffect(() => {
        const [field, direction] = sortOption.split('_');

        const params: ProductFilterParams = {
            ...filters,
            name: searchQuery || undefined,
            page: currentPage,
            size: pageSize,
            sort: field,
            direction: direction
        };

        dispatch(fetchFilteredProducts(params));
    }, [dispatch, filters, sortOption, currentPage, searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page on new search
    };

    const handleApplyFilters = (newFilters: ProductFilterParams) => {
        setFilters(newFilters);
        setCurrentPage(0); // Reset to first page when filters change
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Browse Our Products</h1>
                    <p className="text-muted-foreground">
                        Explore our wide range of freshly baked goods made with quality ingredients
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters sidebar */}
                    <div className="w-full lg:w-1/4">
                        <ProductFilters
                            onApplyFilters={handleApplyFilters}
                            maxPrice={100}
                        />
                    </div>

                    {/* Products grid */}
                    <div className="w-full lg:w-3/4 space-y-6">
                        {/* Search and sort controls */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                            </form>

                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                                    <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                                    <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                                    <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Results count */}
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredProducts.content.length} of {filteredProducts.totalElements} products
                        </div>

                        {/* Products grid */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center py-20">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : filteredProducts.content.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                                <Button onClick={() => {
                                    setSearchQuery("");
                                    setFilters({});
                                }}>Clear all filters</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {filteredProducts.content.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredProducts.totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage + 1}
                                totalPages={filteredProducts.totalPages}
                                onPageChange={(page) => handlePageChange(page - 1)}
                            />
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}