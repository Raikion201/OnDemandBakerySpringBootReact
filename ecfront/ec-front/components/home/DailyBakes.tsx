import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const freshBakes = [
  { id: 1, name: "Artisan Baguette", price: 3.99, timeLeft: "2 hours", image: "baguette.jpg" },
  { id: 2, name: "Cinnamon Rolls", price: 12.99, timeLeft: "4 hours", image: "cinnamon-rolls.jpg" },
  { id: 3, name: "Almond Croissant", price: 4.99, timeLeft: "3 hours", image: "almond-croissant.jpg" },
  { id: 4, name: "Fruit Danish", price: 3.49, timeLeft: "5 hours", image: "danish.jpg" },
];

export function DailyBakes() {
  return (
    <section className="py-16 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Today's Fresh Bakes</h2>
          <p className="text-muted-foreground md:text-xl">Limited quantity, baked fresh this morning</p>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory justify-center">
          {freshBakes.map((product) => (
            <Card 
              key={product.id} 
              className="min-w-[250px] snap-center flex-shrink-0 overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="aspect-video relative bg-muted">
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-xs text-primary">
                  Fresh Bake Image: {product.name}
                </div>
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {product.timeLeft} left
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="font-bold">${product.price}</div>
                  <Button size="sm">Order Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
