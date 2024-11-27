import Image from "next/image";
import Stripes from "@/public/images-landing/stripes-dark.svg";
import { Button } from "../ui/button";

export default function Cta() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-900"
          data-aos="zoom-y-out"
        >
          {/* Glow */}
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] border-blue-500 blur-3xl will-change-[filter]" />
          </div>
          {/* Stripes illustration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
            aria-hidden="true"
          >
            <Image className="max-w-none" src={Stripes} alt="Stripes" />
          </div>
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-6 border-y text-3xl font-bold text-gray-200 [border-image:linear-gradient(to_right,transparent,theme(colors.slate.700/.7),transparent)1] md:mb-12 md:text-4xl">
              Create your next project with Mappie
            </h2>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Button className="text-lg font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-[length:100%_100%] bg-[bottom] text-white shadow hover:bg-[length:100%_150%] px-8 py-4">Start Free Trial</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
