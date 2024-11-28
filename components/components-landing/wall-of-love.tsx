"use client";

import useMasonry from "@/app/(landing)/utils/useMasonry";
import Testimonial from "@/components/components-landing/testimonial";
import TestimonialImg01 from "@/app/(landing)/images-landing/testimonial-01.jpg";
import TestimonialImg02 from "@/app/(landing)/images-landing/testimonial-02.jpg";
import TestimonialImg03 from "@/app/(landing)/images-landing/testimonial-03.jpg";
import TestimonialImg04 from "@/app/(landing)/images-landing/testimonial-04.jpg";
import TestimonialImg05 from "@/app/(landing)/images-landing/testimonial-05.jpg";
import TestimonialImg06 from "@/app/(landing)/images-landing/testimonial-06.jpg";
import TestimonialImg07 from "@/app/(landing)/images-landing/testimonial-07.jpg";
import TestimonialImg08 from "@/app/(landing)/images-landing/testimonial-08.jpg";

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
  {
    img: TestimonialImg05,
    name: "Sarah Chen",
    username: "@sarahchen_pm",
    date: "December 02, 2024",
    content:
      "Mappie's AI assistant is a game-changer for project documentation. It helps me write better user stories and requirements in seconds, understanding the context of our entire project.",
    channel: "Twitter",
  },
  {
    img: TestimonialImg06,
    name: "David Kumar",
    username: "@davidk_tech",
    date: "November 23, 2024",
    content:
      "The AI suggestions in Mappie have transformed how we document our projects. It maintains consistency across all our epics and user stories, saving us hours of review time.",
    channel: "Twitter",
  },
  {
    img: TestimonialImg07,
    name: "Maria Santos",
    username: "@msantos_agile",
    date: "November 29, 2024",
    content:
      "As a Product Owner, Mappie's AI assistant feels like having an experienced PM by my side. It helps refine our requirements and suggests improvements I might have missed.",
    channel: "Twitter",
  },
  {
    img: TestimonialImg08,
    name: "Alex Thompson",
    username: "@alext_dev",
    date: "November 30, 2024",
    content:
      "The context-aware AI in Mappie is brilliant. It understands our project's goals and helps maintain alignment across all documentation. A must-have for any development team.",
    channel: "Twitter",
  }
];

export default function WallOfLove() {
  const masonryContainer = useMasonry();

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {/* Testimonials grid */}
          <div
            ref={masonryContainer}
            className="grid items-start gap-4 sm:grid-cols-3 md:gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <Testimonial
                  testimonial={testimonial}
                  className="w-full rotate-0 md:group-odd:-rotate-1 md:group-even:rotate-1"
                >
                  {testimonial.content}
                </Testimonial>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
