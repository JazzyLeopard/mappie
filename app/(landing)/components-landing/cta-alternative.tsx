import Link from "next/link";

export default function CtaAlternative({
  heading,
  buttonText,
  buttonLink,
  className,
}: {
  heading: string;
  buttonText: string;
  buttonLink: string;
  className?: string;
}) {
  return (
    <section className={`relative ${className}`}>
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-full"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-40 blur-[160px] will-change-[filter]"></div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t text-center [border-image:linear-gradient(to_right,transparent,theme(colors.blue.500/.25),transparent)1]">
          <div className="py-12 md:py-20">
            <h2 className="mb-6 text-3xl font-bold md:mb-12 md:text-4xl">
              {heading}
            </h2>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="text-lg rounded-md font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-[length:100%_100%] bg-[bottom] text-white shadow hover:bg-[length:100%_150%] px-8 py-4"
                href={buttonLink}
              >
                {buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
