"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProductById } from "@/lib/features/products/productSlice";
import { addItemToCart } from "@/lib/features/cart/cartSlice";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Star, ShoppingCart, MinusCircle, PlusCircle, AlertCircle } from "lucide-react";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { product, loading, error } = useAppSelector((state) => state.products);
    const cartItems = useAppSelector((state) => state.cart.items);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(Number(id)));
        }
    }, [dispatch, id]);

    // Find this product in the cart (if it exists)
    const cartItem = product ? cartItems.find(item => item.productId === product.id) : null;
    const currentCartQuantity = cartItem?.quantity || 0;

    // Calculate max available quantity
    const maxAvailableQuantity = product ? Math.max(0, product.quantity - currentCartQuantity) : 0;
    
    // Reset quantity if we set it too high or if product changes
    useEffect(() => {
        if (product) {
            setQuantity(Math.min(1, maxAvailableQuantity));
        }
    }, [product, maxAvailableQuantity]);

    const handleAddToCart = () => {
        if (product && quantity > 0 && maxAvailableQuantity > 0) {
            dispatch(addItemToCart({
                productId: product.id,
                quantity: quantity,
                productDetails: {
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    maxQuantity: product.quantity,
                }
            }));
            
            // Reset quantity after adding to cart
            setQuantity(1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        if (quantity < maxAvailableQuantity) {
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

    const isOutOfStock = product.quantity <= 0 || product.inStock === false;
    const isMaxCartReached = maxAvailableQuantity <= 0;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12 max-w-6xl">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push("/products")}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card rounded-lg p-6 shadow-sm">
                    {/* Product Image - Center the image container */}
                    <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                            <img
                                src={
                                    product.imageUrl.startsWith("http")
                                        ? product.imageUrl
                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/images/${product.imageUrl.split('/').pop()}`
                                }
                                alt={product.name}
                                className="w-full h-full object-contain p-4 max-h-[400px]"
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
                            <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
                                No image available
                            </div>
                        )}
                    </div>

                    {/* Product Info - Better spacing and alignment */}
                    <div className="space-y-6 flex flex-col justify-center">
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
                            {isOutOfStock ? (
                                <div className="text-red-500 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Out of Stock
                                </div>
                            ) : isMaxCartReached ? (
                                <div className="text-amber-600">
                                    Maximum quantity already in cart ({currentCartQuantity})
                                </div>
                            ) : (
                                <div className="text-green-600">
                                    In Stock ({maxAvailableQuantity} available)
                                    {currentCartQuantity > 0 && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                            You already have {currentCartQuantity} in your cart
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {(!isOutOfStock && !isMaxCartReached) ? (
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
                                            disabled={quantity >= maxAvailableQuantity}
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full" 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock || isMaxCartReached || quantity <= 0}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                className="w-full mt-4" 
                                disabled={true}
                            >
                                {isOutOfStock ? (
                                    <>Out of Stock</>
                                ) : (
                                    <>Maximum Quantity in Cart</>
                                )}
                            </Button>
                        )}
                        
                        {currentCartQuantity > 0 && (
                            <div className="mt-2">
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => router.push("/cart")}
                                >
                                    View Cart
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section - Center and constrain width */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Customer Reviews</h2>
                    <Separator className="mb-6" />

                    {product.feedbacks && product.feedbacks.length > 0 ? (
                        <div className="space-y-6">
                            {product.feedbacks.map((feedback) => (
                                <Card key={feedback.id} className="mx-auto">
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