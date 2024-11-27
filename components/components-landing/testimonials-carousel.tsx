import Testimonial from "./testimonial";
import TestimonialImg01 from "@/public/images-landing/testimonial-01.jpg";
import TestimonialImg02 from "@/public/images-landing/testimonial-02.jpg";
import TestimonialImg03 from "@/public/images-landing/testimonial-03.jpg";
import TestimonialImg04 from "@/public/images-landing/testimonial-04.jpg";

export default function TestimonialsCarousel() {
  const testimonials = [
    {
      img: TestimonialImg01,
      name: "Sarah Chen",
      username: "@sarahchen_pm",
      date: "December 02, 2024",
      content:
        "Mappie's AI assistant is a game-changer for project documentation. It helps me write better user stories and requirements in seconds, understanding the context of our entire project.",
      channel: "Twitter",
    },
    {
      img: TestimonialImg02,
      name: "David Kumar",
      username: "@davidk_tech",
      date: "November 23, 2024",
      content:
        "The AI suggestions in Mappie have transformed how we document our projects. It maintains consistency across all our epics and user stories, saving us hours of review time.",
      channel: "Twitter",
    },
    {
      img: TestimonialImg03,
      name: "Maria Santos",
      username: "@msantos_agile",
      date: "November 29, 2024",
      content:
        "As a Product Owner, Mappie's AI assistant feels like having an experienced PM by my side. It helps refine our requirements and suggests improvements I might have missed.",
      channel: "Twitter",
    },
    {
      img: TestimonialImg04,
      name: "Alex Thompson",
      username: "@alext_dev",
      date: "November 30, 2024",
      content:
        "The context-aware AI in Mappie is brilliant. It understands our project's goals and helps maintain alignment across all documentation. A must-have for any development team.",
      channel: "Twitter",
    },
  ];

  return (
    <section className="relative before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:h-[120%] before:bg-gradient-to-b before:from-gray-100">
      <div className="pt-12 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Teams love Mappie's AI.
            </h2>
          </div>
        </div>
        <div className="relative mx-auto flex max-w-[94rem] justify-center">
          <div
            className="absolute bottom-20 -z-10 -translate-x-36"
            aria-hidden="true"
          >
            <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-30 blur-[160px] will-change-[filter]" />
          </div>
          <div className="absolute -bottom-10 -z-10" aria-hidden="true">
            <div className="h-80 w-80 rounded-full bg-blue-500 opacity-40 blur-[160px] will-change-[filter]" />
          </div>
          <div className="absolute bottom-0 -z-10" aria-hidden="true">
            <div className="h-56 w-56 rounded-full border-[20px] border-white blur-[20px] will-change-[filter]" />
          </div>
          {/* Row */}
          <div className="group inline-flex w-full flex-nowrap py-12 [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)] md:py-20">
            <div className="flex animate-[infinite-scroll_60s_linear_infinite] items-start justify-center group-hover:[animation-play-state:paused] md:justify-start [&>*]:mx-3">
              {/* Items */}
              {testimonials.map((testimonial, index) => (
                <Testimonial
                  key={index}
                  testimonial={testimonial}
                  className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
                >
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex animate-[infinite-scroll_60s_linear_infinite] items-start justify-center group-hover:[animation-play-state:paused] md:justify-start [&>*]:mx-3"
              aria-hidden="true"
            >
              {/* Items */}
              {testimonials.map((testimonial, index) => (
                <Testimonial
                  key={index}
                  testimonial={testimonial}
                  cloned={true}
                  className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
                >
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
