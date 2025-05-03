"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/features/products/productSlice";
import { useAppDispatch } from "@/lib/hooks";
import { addItemToCart } from "@/lib/features/cart/cartSlice";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const dispatch = useAppDispatch();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to detail page

        dispatch(
            addItemToCart({
                productId: product.id,
                quantity: 1,
                productDetails: {
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                },
            })
        );

        toast.success(`Added ${product.name} to cart`);
    };

    return (
        <Link href={`/products/${product.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
                <div className="aspect-square relative bg-muted">
                    {product.imageUrl ? (
                        <img
                            src={
                                product.imageUrl.startsWith("http")
                                    ? product.imageUrl
                                    : `http://localhost:8080${product.imageUrl}`
                            }
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                console.error("Image failed to load:", product.imageUrl);
                                (e.target as HTMLImageElement).src = "/placeholder-image.png";
                                // Fallback to data URI if no placeholder image exists
                                (e.target as HTMLImageElement).onerror = () => {
                                    (e.target as HTMLImageElement).src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E";
                                };
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-xs text-primary">
                            Product Image
                        </div>
                    )}
                    {(product.quantity <= 0 || product.inStock === false) && (
                        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs py-1 px-2 rounded-full">
                            Sold Out
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        {product.avgRating && (
                            <div className="flex items-center text-sm">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span>{product.avgRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <div className="font-bold">${product.price.toFixed(2)}</div>
                        <Button size="sm" variant="outline" onClick={handleAddToCart}>
                            <ShoppingCart className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}