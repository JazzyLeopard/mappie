export const metadata = {
  title: "Support - Simple",
  description: "Page description",
};

import Hero from "./hero";
import Faqs from "@/app/(landing)/components-landing/faqs-02";
import Cta from "@/app/(landing)/components-landing/cta-alternative";

export default function Support() {
  return (
    <>
      <Hero />
      <Faqs />
      <Cta
        className="overflow-hidden"
        heading="Cannot find what you're looking for?"
        buttonText="Contact Us"
        buttonLink="#0"
      />
    </>
  );
}
