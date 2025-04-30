import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah L.",
    comment: "The sourdough bread is phenomenal! I've never tasted anything like it. Will definitely order again.",
    rating: 5,
  },
  {
    name: "Michael T.",
    comment: "I ordered a birthday cake and it exceeded all expectations. Not only was it beautiful, but it tasted amazing!",
    rating: 5,
  },
  {
    name: "Jessica R.",
    comment: "The pastry box is my weekend treat. Everything is always so fresh and the flavors are incredible.",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-muted flex justify-center" >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Customer Love</h2>
          <p className="text-muted-foreground md:text-xl">See what our customers are saying about our baked goods</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? "fill-primary text-primary" : "text-muted"}`} 
                    />
                  ))}
                </div>
                <p className="italic">"{testimonial.comment}"</p>
                <div className="font-semibold">- {testimonial.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
