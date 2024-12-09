export const metadata = {
  title: "Customer Stories - Mappie",
  description: "See how teams use Mappie's AI assistant to improve their project documentation",
};

import Hero from "./hero";
import WallOfLove from "@/app/(landing)/components-landing/wall-of-love";
import Cta from "@/app/(landing)/components-landing/cta-alternative";

export default function Customers() {
  return (
    <>
      <Hero />
      <WallOfLove />
      <Cta
        heading="Start documenting smarter with Mappie"
        buttonText="Try Mappie Free"
        buttonLink="#0"
      />
    </>
  );
}
