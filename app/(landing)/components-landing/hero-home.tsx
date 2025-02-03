"use client";

import PageIllustration from "./page-illustration";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import ProductDevelopmentProcess from "@/components/product-development-process";
import Link from "next/link";

export default function HeroHome() {
  const { isSignedIn } = useUser();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            <h1
              className="mb-6 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.purple.300/.8),transparent)1] md:text-6xl"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              <span className="bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] text-transparent bg-clip-text">From requirements to</span>
              <br className="max-lg:hidden" />
              <span className="bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] text-transparent bg-clip-text">dev-ready stories.</span>
              <br className="max-lg:hidden" />
              <span className="bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] text-transparent bg-clip-text">Superfast,with AI.</span>
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-lg text-center text-gray-700"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                Create, generate, edit and map your product requirements with Mappie's powerful AI.
              </p>

              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.purple.300/.8),transparent)1]">
                <div
                  className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  {isSignedIn ? (
                    <Button className="group mb-4 w-full text-white shadow hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto">
                      <span className="relative inline-flex items-center">
                        <Link href="/epics">Enter Mappie</Link> {" "}
                        <span className="ml-1 tracking-normal text-purple-200 transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </Button>
                  ) : (
                    <Button className="group mb-4 w-full text-white shadow hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto">
                      <span className="relative inline-flex items-center">
                        Get Started {" "}
                        <span className="ml-1 tracking-normal text-purple-200 transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full sm:ml-4 sm:w-auto">
                    See How It Works
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero visualization */}
          <div className="mx-auto max-w-3xl">
            <ProductDevelopmentProcess />
          </div>
        </div>
      </div>
    </section>
  );
}