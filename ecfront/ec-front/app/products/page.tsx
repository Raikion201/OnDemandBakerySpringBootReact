"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllProducts } from "@/lib/features/products/productSlice"; // We'll modify this action
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
    const { products, loading, error } = useAppSelector((state) => state.products);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("name_asc");
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState({
        minPrice: undefined as number | undefined,
        maxPrice: undefined as number | undefined,
        inStock: undefined as boolean | undefined,
    });

    const pageSize = 8;

    // Fetch all products on initial load
    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    // Apply client-side filtering, sorting, and pagination
    const filteredAndSortedProducts = useMemo(() => {
        // Filter products based on search query and filters
        let result = [...products];
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(query) || 
                (product.description && product.description.toLowerCase().includes(query))
            );
        }
        
        // Apply price filters
        if (filters.minPrice !== undefined) {
            result = result.filter(product => product.price >= filters.minPrice!);
        }
        
        if (filters.maxPrice !== undefined) {
            result = result.filter(product => product.price <= filters.maxPrice!);
        }
        
        // Apply in-stock filter
        if (filters.inStock !== undefined) {
            result = result.filter(product => 
                filters.inStock ? product.quantity > 0 : true
            );
        }
        
        // Apply sorting
        const [field, direction] = sortOption.split('_');
        result.sort((a, b) => {
            if (field === 'name') {
                return direction === 'asc' 
                    ? a.name.localeCompare(b.name) 
                    : b.name.localeCompare(a.name);
            } else if (field === 'price') {
                return direction === 'asc' 
                    ? a.price - b.price 
                    : b.price - a.price;
            }
            return 0;
        });
        
        return result;
    }, [products, searchQuery, filters, sortOption]);
    
    // Get current page items
    const currentProducts = useMemo(() => {
        const startIndex = currentPage * pageSize;
        return filteredAndSortedProducts.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedProducts, currentPage, pageSize]);
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page on new search
    };

    const handleApplyFilters = (newFilters: any) => {
        setFilters(newFilters);
        setCurrentPage(0); // Reset to first page when filters change
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
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
                            Showing {currentProducts.length} of {filteredAndSortedProducts.length} products
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
                        ) : currentProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                                <Button onClick={() => {
                                    setSearchQuery("");
                                    setFilters({
                                        minPrice: undefined,
                                        maxPrice: undefined,
                                        inStock: undefined
                                    });
                                }}>Clear all filters</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {currentProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}