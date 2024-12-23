export const metadata = {
  title: "Mappie Beta - AI-Powered Project Planning",
  description: "Join 100 users getting early access to the future of project planning. Transform messy requirements into precise, dev-ready stories.",
};

import Hero from "@/app/(landing)/beta/hero-home";
import VideoDemo from "@/app/(landing)/components-landing/video-demo";
import ContactSection from "@/app/(landing)/beta/contact";
import FeatureShowcaseCarousel from "@/app/(landing)/beta/feature-showcase-carousel";

export default function Home() {
  return (
    <div className="relative w-full max-w-[100vw] overflow-x-clip">
      <Hero />
      <VideoDemo />
      <FeatureShowcaseCarousel />
      <ContactSection />
    </div>
  );
}
