import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Subscribe to Our Newsletter</h2>
            <p>
              Be the first to know about new products, seasonal specials, and exclusive offers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-primary-foreground flex-1"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
