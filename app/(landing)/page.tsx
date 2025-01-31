export const metadata = {
  title: "Mappie AI - Become the Agile Product Manager devs love to work with",
  description: "Transform messy requirements into precise, dev-ready epics, features and stories.",
};

import ContactSection from "@/app/(landing)/beta/contact";
import Hero from "@/app/(landing)/beta/hero-home";
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
