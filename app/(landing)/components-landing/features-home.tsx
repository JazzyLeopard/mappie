"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FeaturesHome() {
  return (
    <section className="relative">
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-40 blur-[160px] will-change-[filter]" />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Your Intelligent Project Assistant
            </h2>
            <p className="text-lg text-gray-700">
              Meet your AI copilot that understands your project context and helps you create better documentation through intelligent suggestions and automated content generation.
            </p>
          </div>
          {/* Illustration */}
          <motion.div
            className="group relative mx-auto flex w-full max-w-[500px] justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -z-10 w-full h-full">
                <div className="h-full w-full rounded-full bg-gradient-to-tr from-pink-400 to-blue-400 opacity-40 blur-[100px]" />
              </div>
              <div className="pointer-events-none mb-[7%] translate-y-2 transition duration-300 group-hover:translate-y-0">
                <Image
                  src="/ai-chat.png"
                  width={500}
                  height={900}
                  alt="AI Chat"
                  priority
                />
              </div>
            </div>
          </motion.div>
          {/* Grid */}
          <div className="grid overflow-hidden border-y [border-image:linear-gradient(to_right,transparent,theme(colors.slate.200),transparent)1] lg:grid-cols-3 [&>*]:relative [&>*]:p-6 [&>*]:before:absolute [&>*]:before:bg-gradient-to-b [&>*]:before:from-transparent [&>*]:before:via-gray-200 [&>*]:before:[block-size:100%] [&>*]:before:[inline-size:1px] [&>*]:before:[inset-block-start:0] [&>*]:before:[inset-inline-start:-1px] md:[&>*]:px-10 md:[&>*]:py-12">
            <article className="bg-white bg-opacity-50">
              <h3 className="mb-2 flex items-center space-x-2 font-medium">
                <svg
                  className=""
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="m15.447 6.605-.673-.336a6.973 6.973 0 0 0-.761-1.834l.238-.715a.999.999 0 0 0-.242-1.023l-.707-.707a.995.995 0 0 0-1.023-.242l-.715.238a6.96 6.96 0 0 0-1.834-.761L9.394.552A1 1 0 0 0 8.5-.001h-1c-.379 0-.725.214-.895.553l-.336.673a6.973 6.973 0 0 0-1.834.761l-.715-.238a.997.997 0 0 0-1.023.242l-.707.707a1.001 1.001 0 0 0-.242 1.023l.238.715a6.959 6.959 0 0 0-.761 1.834l-.673.336a1 1 0 0 0-.553.895v1c0 .379.214.725.553.895l.673.336c.167.653.425 1.268.761 1.834l-.238.715a.999.999 0 0 0 .242 1.023l.707.707a.997.997 0 0 0 1.023.242l.715-.238a6.959 6.959 0 0 0 1.834.761l.336.673a1 1 0 0 0 .895.553h1c.379 0 .725-.214.895-.553l.336-.673a6.973 6.973 0 0 0 1.834-.761l.715.238a1.001 1.001 0 0 0 1.023-.242l.707-.707c.268-.268.361-.664.242-1.023l-.238-.715a6.959 6.959 0 0 0 .761-1.834l.673-.336A1 1 0 0 0 16 8.5v-1c0-.379-.214-.725-.553-.895ZM8 13a5 5 0 1 1 .001-10.001 5 5 0 0 1 0 10.001Z" />
                </svg>
                <span>Context-Aware Intelligence</span>
              </h3>
              <p className="text-[15px] text-gray-700">
                Our AI assistant understands your entire project context, providing relevant suggestions and insights based on your requirements, epics, and user stories.
              </p>
            </article>
            <article className="bg-white bg-opacity-50">
              <h3 className="mb-2 flex items-center space-x-2 font-medium">
                <svg
                  className=""
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={12}
                >
                  <path d="M2 0a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H2Zm0 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm1-3a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H3Z" />
                </svg>
                <span>Smart Content Generation</span>
              </h3>
              <p className="text-[15px] text-gray-700">
                Get intelligent suggestions for requirements, acceptance criteria, and user stories that align with your project goals and maintain consistency across documentation.
              </p>
            </article>
            <article className="bg-white bg-opacity-50">
              <h3 className="mb-2 flex items-center space-x-2 font-medium">
                <svg
                  className=""
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="M14.75 2.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm0 13.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM2.5 14.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM1.25 2.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-6a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z" />
                </svg>
                <span>Always Available Support</span>
              </h3>
              <p className="text-[15px] text-gray-700">
                Access AI assistance throughout your documentation journey - from initial project setup to detailed user stories, with contextual help available on every page.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
