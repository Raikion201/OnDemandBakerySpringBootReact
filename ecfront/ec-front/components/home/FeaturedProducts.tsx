import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";

const products = [
  { id: 1, name: "Sourdough Bread", price: 5.99, rating: 4.8, image: "sourdough.jpg" },
  { id: 2, name: "Chocolate Croissant", price: 3.99, rating: 4.7, image: "croissant.jpg" },
  { id: 3, name: "Red Velvet Cake", price: 24.99, rating: 4.9, image: "red-velvet.jpg" },
  { id: 4, name: "Chocolate Chip Cookies", price: 12.99, rating: 4.6, image: "cookies.jpg" },
];

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-muted flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Products</h2>
          <p className="text-muted-foreground md:text-xl">Our most popular baked goods that customers love</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="aspect-square relative bg-muted">
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-xs text-primary">
                  Product Image: {product.name}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span>{product.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="font-bold">${product.price}</div>
                  <Button size="sm" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Button size="lg">View All Products</Button>
        </div>
      </div>
    </section>
  );
}
