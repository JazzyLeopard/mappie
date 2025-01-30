export const metadata = {
<<<<<<< HEAD
  title: "Mappie Beta - AI-Powered Project Planning",
  description: "Join 100 users getting early access to the future of project planning. Transform messy requirements into precise, dev-ready stories.",
};

import Hero from "@/app/(landing)/beta/hero-home";
import VideoDemo from "@/app/(landing)/components-landing/video-demo";
import ContactSection from "@/app/(landing)/beta/contact";
import FeatureShowcaseCarousel from "@/app/(landing)/beta/feature-showcase-carousel";

export default function Home() {
  return (
    <div className="w-full md:px-0">
      <Hero />
      <VideoDemo />
      <FeatureShowcaseCarousel />
      <ContactSection />
    </div>
  );
}
=======
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
>>>>>>> 4d800513f4ae0a811554048e1c6c39b33e4a27a2
