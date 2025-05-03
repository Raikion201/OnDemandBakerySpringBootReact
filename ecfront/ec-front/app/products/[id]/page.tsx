"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProductById } from "@/lib/features/products/productSlice";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Star, ShoppingCart, MinusCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { product, loading, error } = useAppSelector((state) => state.products);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(Number(id)));
        }
    }, [dispatch, id]);

    const handleAddToCart = () => {
        // Add to cart logic here
        toast.success(`Added ${quantity} ${product?.name} to cart`);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        if (product && quantity < product.quantity) {
            setQuantity(quantity + 1);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 container px-4 py-8 md:px-6 md:py-12 flex justify-center items-center">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 container px-4 py-8 md:px-6 md:py-12 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "The product you're looking for doesn't exist or has been removed."}</p>
                    <Button onClick={() => router.push("/products")}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push("/products")}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="bg-muted rounded-lg overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl.startsWith('http')
                                    ? product.imageUrl
                                    : `http://localhost:8080${product.imageUrl}`}
                                alt={product.name}
                                className="w-full h-full object-contain p-4"
                                style={{ maxHeight: '500px' }}
                                onError={(e) => {
                                    console.error("Image failed to load:", product.imageUrl);
                                    (e.target as HTMLImageElement).src = "/placeholder-image.png";
                                    // Fallback to data URI if no placeholder image exists
                                    (e.target as HTMLImageElement).onerror = () => {
                                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                    };
                                }}
                            />
                        ) : (
                            <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
                                No image available
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">{product.name}</h1>

                            {product.avgRating && (
                                <div className="flex items-center mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.round(product.avgRating!) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground">({product.avgRating.toFixed(1)})</span>
                                </div>
                            )}
                        </div>

                        <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>

                        <p className="text-muted-foreground">{product.description}</p>

                        <div className="bg-muted p-4 rounded-md">
                            <div className="font-medium mb-2">Availability:</div>
                            {(product.quantity > 0 && product.inStock !== false) ? (
                                <div className="text-green-600">In Stock ({product.quantity} available)</div>
                            ) : (
                                <div className="text-red-500">Out of Stock</div>
                            )}
                        </div>

                        {(product.quantity > 0 && product.inStock !== false) && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="font-medium">Quantity:</div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={decreaseQuantity}
                                            disabled={quantity <= 1}
                                        >
                                            <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <div className="w-8 text-center">{quantity}</div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={increaseQuantity}
                                            disabled={quantity >= product.quantity}
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button className="w-full" onClick={handleAddToCart}>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                    <Separator className="mb-6" />

                    {product.feedbacks && product.feedbacks.length > 0 ? (
                        <div className="space-y-6">
                            {product.feedbacks.map((feedback) => (
                                <Card key={feedback.id}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{feedback.user.username}</div>
                                                <div className="flex items-center mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < feedback.star ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(feedback.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="mt-4">{feedback.content}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No reviews yet for this product
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}