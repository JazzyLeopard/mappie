"use client";

import PageIllustration from "../components-landing/page-illustration";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import Link from "next/link";
import { useUserCount } from "@/app/hooks/useUserCount";
import { SignUpButton } from "@clerk/clerk-react";

export default function BetaHero() {
  const { isSignedIn } = useUser();
  const { userCount, loading } = useUserCount();
  
  const spotsRemaining = 100 - (userCount || 0);
  const spotsClaimed = userCount || 0;

  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="pb-12 text-center md:pb-16">
            {/* Beta Badge */}
            <div 
              className="inline-block px-3 py-1 mb-6 text-sm font-semibold rounded-full bg-gradient-to-r from-[#F596D3] to-[#A855D8] text-white"
              data-aos="zoom-y-out"
              data-aos-delay={100}
            >
              Beta Access Now Open • Increased to 200 Spots
            </div>

            <h1
              className="mb-6 border-y text-3xl sm:text-4xl lg:text-6xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.purple.300/.8),transparent)1]"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              <span className="bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] mr-2 text-transparent bg-clip-text">Transform messy</span>
              <br className="max-lg:hidden" />
              <span className="bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] mr-2 text-transparent bg-clip-text">requirements into</span>
              <br className="max-lg:hidden" />
              <span className="bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] text-transparent bg-clip-text">dev-ready stories</span>
            </h1>

            <div className="mx-auto max-w-3xl">
              <div className="mb-8 text-lg text-center text-gray-700">
                <p>Join 200 pioneers 🚀 transforming project planning</p>
                <p>by letting Mappie turn vague ideas ✏️ into clear specs.</p>
              </div>

              {/* Centered Beta Button */}
              <div
                className="flex justify-center mb-12"
                data-aos="zoom-y-out"
                data-aos-delay={450}
              >
                {isSignedIn ? (
                  <Button className="group text-white shadow hover:bg-[length:100%_150%]">
                    <span className="relative inline-flex items-center">
                      <Link href="/epics">Enter Mappie</Link>{" "}
                      <span className="ml-1 tracking-normal text-purple-200 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Button>
                ) : (
                  <SignUpButton mode="modal" forceRedirectUrl={"/epics"}>
                    <Button className="group text-white shadow hover:bg-[length:100%_150%]">
                      <span className="relative inline-flex items-center">
                        Join Beta Users{" "}
                        <span className="ml-1 tracking-normal text-purple-200 transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </Button>
                  </SignUpButton>
                )}
              </div>

              {/* Beta Stats */}
              <div 
                className="flex flex-col items-center justify-center mb-8"
                data-aos="zoom-y-out"
                data-aos-delay={600}
              >
                {/* Counter */}
                <div className="relative mb-10">
                  <div className="absolute -inset-6 rounded-lg bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] opacity-20 blur-lg"></div>
                  <div className="relative flex items-center justify-center space-x-4 rounded-lg bg-white/50 px-12 py-6 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] text-transparent bg-clip-text">
                        {loading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <span>{spotsClaimed}</span>
                        )}
                        <span className="text-3xl text-gray-400">/200</span>
                      </div>
                      <div className="mt-1 text-lg text-gray-600">spots claimed</div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                  <div>⭐️ Free for the first 100 users</div>
                  <div>🔥 Direct access to the founders</div>
                </div>
              </div>

              {/* See How It Works - Bottom Section */}
              <div className="text-center pt-8 border-t [border-image:linear-gradient(to_right,transparent,theme(colors.purple.300/.8),transparent)1]">
                <p className="text-gray-600 mb-4">Want to see Mappie in action?</p>
                <Button 
                  variant="outline" 
                  className="group"
                  data-aos="zoom-y-out"
                  data-aos-delay={750}
                  onClick={() => {
                    document.getElementById('video-demos')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  <span className="relative inline-flex items-center">
                    See How It Works{" "}
                    <span className="ml-1 tracking-normal text-purple-500 transition-transform group-hover:translate-y-0.5">
                      ↓
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}