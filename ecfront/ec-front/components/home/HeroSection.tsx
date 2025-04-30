import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full py-20 bg-gradient-to-b from-background to-muted">
      {/* Centered content container with padding */}
      <div className="w-full flex justify-center">
        <div className="container px-32 flex flex-col-reverse md:flex-row items-center justify-center gap-12">
          <div className="flex flex-col items-start gap-4 md:gap-6 md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Fresh Baked <span className="text-primary">Goodness</span> Delivered Daily
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-[600px]">
              Experience artisanal baked goods made from scratch with the finest ingredients, 
              delivered straight to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Shop Now <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-lg overflow-hidden">
              <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary">
                Hero Image: Freshly Baked Bread
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
