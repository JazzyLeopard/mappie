export const metadata = {
  title: "Pricing - Simple",
  description: "Page description",
};

import PricingTables from "@/components/components-landing/pricing-tables";
import ComparePlans from "@/components/components-landing/compare-plans";
import TestimonialsGrid from "@/components/components-landing/testimonials-grid";
import Faqs from "@/components/components-landing/faqs";
import Cta from "@/components/components-landing/cta-alternative";

export default function Pricing() {
  return (
    <>
      <PricingTables />
      <ComparePlans />
      <TestimonialsGrid />
      <Faqs />
      <Cta
        className="overflow-hidden"
        heading="Create your next project with Simple"
        buttonText="Start Free Trial"
        buttonLink="#0"
      />
    </>
  );
}
