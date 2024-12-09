export const metadata = {
  title: "Mappie Beta - AI-Powered Project Planning",
  description: "Join 100 users getting early access to the future of project planning. Transform messy requirements into precise, dev-ready stories.",
};

import Hero from "@/app/(landing)/beta/hero-home";
import BetaFeatures from "@/app/(landing)/beta/features";
import VideoDemo from "@/app/(landing)/components-landing/video-demo";
import ContactSection from "@/app/(landing)/beta/contact";
// import BetaTestimonial from "@/app/(landing)/beta/testimonials";
// import BetaWaitlist from "@/app/(landing)/beta/waitlist";
// import BetaFaq from "@/app/(landing)/beta/faq";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <VideoDemo />
      <BetaFeatures />
      <ContactSection />
      {/* <BetaTestimonial /> */}
      {/* <BetaWaitlist /> */}
      {/* <BetaFaq /> */}
    </div>
  );
}
