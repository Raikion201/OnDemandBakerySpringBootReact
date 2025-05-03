"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterIcon, X } from "lucide-react";

export interface ProductFilterParams {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    size?: number;
    sort?: string;
    direction?: string;
}

interface ProductFiltersProps {
    onApplyFilters: (filters: ProductFilterParams) => void;
    maxPrice: number;
}

export function ProductFilters({ onApplyFilters, maxPrice = 100 }: ProductFiltersProps) {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
    const [inStock, setInStock] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState(false);

    const handlePriceChange = (value: number[]) => {
        setPriceRange([value[0], value[1]]);
    };

    const handleInStockChange = (checked: boolean) => {
        setInStock(checked);
    };

    const applyFilters = () => {
        onApplyFilters({
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            inStock: inStock
        });
    };

    const resetFilters = () => {
        setPriceRange([0, maxPrice]);
        setInStock(false);
        onApplyFilters({});
    };

    return (
        <>
            <div className="md:hidden mb-4">
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="flex items-center">
                        <FilterIcon className="mr-2 h-4 w-4" />
                        Filters
                    </span>
                    {showFilters ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                            {inStock || priceRange[0] > 0 || priceRange[1] < maxPrice ? 'Active' : ''}
                        </span>
                    )}
                </Button>
            </div>

            <Card className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">Price Range</h3>
                        <Slider
                            min={0}
                            max={maxPrice}
                            step={1}
                            value={[priceRange[0], priceRange[1]]}
                            onValueChange={handlePriceChange}
                            className="py-4"
                        />
                        <div className="flex items-center justify-between">
                            <span>${priceRange[0].toFixed(2)}</span>
                            <span>${priceRange[1].toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="in-stock"
                            checked={inStock}
                            onCheckedChange={handleInStockChange}
                        />
                        <Label htmlFor="in-stock">In Stock Only</Label>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button onClick={applyFilters}>Apply Filters</Button>
                        <Button variant="outline" onClick={resetFilters}>Reset</Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}