"use client";


import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="w-full flex justify-center">
        <div className="w-full px-8">
          {isClient && <Navbar />}
        </div>
      </div>
      
      {/* Hero section with full width background */}
      <div className="w-full">
        {isClient && <HeroSection />}
      </div>
      
      {/* Rest of content with horizontal centering and padding */}
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full px-8">
          {isClient && <TestimonialsSection />}
        </div>
        <div className="w-full px-8">
          {isClient && <AboutSection />}
        </div>
        <div className="w-full px-8">
          {isClient && <NewsletterSection />}
        </div>
      </main>
      
      {/* Footer with padding */}
      <div className="w-full flex justify-center">
        <div className="w-full px-8">
          {isClient && <Footer />}
        </div>
      </div>
    </div>
  );
}
