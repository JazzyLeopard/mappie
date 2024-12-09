"use client";

import Button from "@/app/(main)/_components/Lexical/ui/Button";
import PageIllustration from "@/app/(landing)/components-landing/page-illustration";

export default function Hero() {
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main content */}
        <div className="mx-auto max-w-3xl pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-10 text-center">
            <h1 className="mb-6 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl">
              Our wall of love
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-lg text-gray-700">
                Read and listen to what our customers are saying about Simple.
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <Button className="text-lg font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-[length:100%_100%] bg-[bottom] text-white shadow hover:bg-[length:100%_150%] px-8 py-4" onClick={() => {
                  window.location.href = "";
                }}>Share Your Testimonial</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
