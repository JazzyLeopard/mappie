export const metadata = {
  title: "Pricing - Simple",
  description: "Page description",
};

import PricingTables from "@/app/(landing)/components-landing/pricing-tables";
import ComparePlans from "@/app/(landing)/components-landing/compare-plans";
import TestimonialsGrid from "@/app/(landing)/components-landing/testimonials-grid";
import Faqs from "@/app/(landing)/components-landing/faqs";
import Cta from "@/app/(landing)/components-landing/cta-alternative";

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
