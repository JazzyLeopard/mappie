export const metadata = {
  title: "Home - Mappie",
  description: "Page description",
};

import Hero from "@/components/components-landing/hero-home";
import BusinessCategories from "@/components/components-landing/business-categories";
import LargeTestimonial from "@/components/components-landing/large-testimonial";
import Features from "@/components/components-landing/features-home";
import TestimonialsCarousel from "@/components/components-landing/testimonials-carousel";
import Cta from "@/components/components-landing/cta";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <BusinessCategories />
      <LargeTestimonial />
      <Features />
      <TestimonialsCarousel />
      <Cta />
    </div>
  );
}
