import { Button } from "@/components/ui/button";
import { TrendingUp, Bookmark } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-16 bg-background flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="aspect-video rounded-lg bg-muted relative">
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary">
                Bakery Image: Our Story
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Baking Philosophy</h2>
            <p className="text-muted-foreground">
              At BakeDelights, we believe in using traditional methods and the finest ingredients to create 
              exceptional baked goods. Every item is crafted with care by our skilled bakers.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Artisanal Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Handcrafted with traditional techniques passed down through generations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Finest Ingredients</h3>
                  <p className="text-sm text-muted-foreground">
                    We source only the best organic and local ingredients for superior flavor.
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline">Learn More About Us</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
