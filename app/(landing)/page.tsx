export const metadata = {
  title: "Mappie AI - Become the Agile Product Manager devs love to work with",
  description: "Transform messy requirements into precise, dev-ready epics, features and stories.",
};

import Hero from "@/app/(landing)/beta/hero-home";
import ContactSection from "@/app/(landing)/beta/contact";
import FeatureShowcaseCarousel from "@/app/(landing)/beta/feature-showcase-carousel";
import { BentoDemo } from "@/components/ui/bento/index";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <BentoDemo />
      <ContactSection />
    </div>
  );
}