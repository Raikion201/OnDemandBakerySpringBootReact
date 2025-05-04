import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | BakeDelights",
  description: "Learn about our bakery's story, mission, and the team behind our delicious creations.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Story</h1>
                <p className="text-muted-foreground text-lg">
                  Founded in 2023, BakeDelights began as a small family bakery with a passion for creating
                  exceptional baked goods using traditional methods and the finest ingredients.
                </p>
              </div>
              <div className="md:w-1/2 relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                <Image 
                  src="/baker1.jpg"
                  alt="Our Bakery Store"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                At BakeDelights, our mission is to bring joy to our customers through freshly baked goods made with love
                and the highest quality ingredients. We believe in preserving traditional baking techniques while
                embracing innovation to create products that delight with every bite.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We source only the finest organic and locally-produced ingredients, ensuring that
                    everything we bake meets our high standards of quality and taste.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Traditional Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our bakers use time-honored techniques passed down through generations, taking no
                    shortcuts in the pursuit of perfection.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Community Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're proud to be part of our local community, creating jobs and supporting local
                    farmers and suppliers whenever possible.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Head Baker",
                  bio: "With over 15 years of experience, Sarah leads our baking team with creativity and passion."
                },
                {
                  name: "Michael Chen",
                  role: "Pastry Chef",
                  bio: "A graduate of Le Cordon Bleu, Michael brings artistry and precision to our pastry creations."
                },
                {
                  name: "Emily Rodriguez",
                  role: "Bread Specialist",
                  bio: "Emily specializes in artisanal sourdough and traditional bread-making techniques."
                }
              ].map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-center">{member.name}</h3>
                    <p className="text-center text-muted-foreground mb-2">{member.role}</p>
                    <p className="text-center text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Visit us section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-3xl font-bold">Visit Our Bakery</h2>
                <p className="text-muted-foreground">
                  We'd love to welcome you to our bakery. Come visit us to experience the aroma of
                  freshly baked goods and taste our delicious creations.
                </p>
                <div className="space-y-2">
                  <p><strong>Address:</strong> 123 Main Street, Bakeryville, CA 90210</p>
                  <p><strong>Hours:</strong> Monday-Friday: 7am-7pm, Saturday-Sunday: 8am-5pm</p>
                  <p><strong>Phone:</strong> (555) 123-4567</p>
                  <p><strong>Email:</strong> info@bakedelights.com</p>
                </div>
                <Button className="mt-4">Contact Us</Button>
              </div>
              <div className="md:w-1/2 relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary">
                  Map or Bakery Location Image
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
