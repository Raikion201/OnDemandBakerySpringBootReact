import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { name: "Bread", icon: "🍞" },
  { name: "Pastries", icon: "🥐" },
  { name: "Cakes", icon: "🎂" },
  { name: "Cookies", icon: "🍪" },
  { name: "Muffins", icon: "🧁" },
  { name: "Pies", icon: "🥧" },
  { name: "Gluten-Free", icon: "🌱" },
  { name: "Vegan", icon: "🥦" },
];

export function CategoriesSection() {
  return (
    <section className="py-16 bg-background flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Categories</h2>
          <p className="text-muted-foreground md:text-xl">Browse our delicious baked goods by category</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link href={`/categories/${category.name.toLowerCase()}`} key={category.name}>
              <Card className="transition-all hover:shadow-lg">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="text-xl font-bold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
