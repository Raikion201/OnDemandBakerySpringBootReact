import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Navbar with padding */}
      <div className="w-full flex justify-center">
        <div className="w-full px-8">
          <Navbar />
        </div>
      </div>
      
      {/* Hero section with full width background */}
      <div className="w-full">
        <HeroSection />
      </div>
      
      {/* Rest of content with horizontal centering and padding */}
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full px-8">
          <CategoriesSection />
        </div>
        <div className="w-full px-8">
          <FeaturedProducts />
        </div>
        <div className="w-full px-8">
          <TestimonialsSection />
        </div>
        <div className="w-full px-8">
          <AboutSection />
        </div>
        <div className="w-full px-8">
          <NewsletterSection />
        </div>
      </main>
      
      {/* Footer with padding */}
      <div className="w-full flex justify-center">
        <div className="w-full px-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}
