"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MessageModal } from "@/components/MessageModal";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="contact" className="relative px-4 md:px-6 lg:px-8 py-12 md:py-20 min-h-[40vh] md:min-h-[60vh]">
      {/* Background gradient - adjusted for better mobile appearance */}
      <div 
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/2" 
        aria-hidden="true"
      >
        <div className="h-60 w-60 md:h-80 md:w-80 rounded-full bg-gradient-to-tr from-pink-400 to-blue-400 opacity-40 blur-[100px] md:blur-[160px] will-change-[filter]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="py-8 md:py-12">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="shadow-xl shadow-gray-500/10 px-4 py-6 md:px-8 md:py-12 mb-8 md:mb-12 
                          bg-white/50 backdrop-blur-sm rounded-xl md:rounded-2xl">
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl 
                         bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 
                         bg-clip-text text-transparent font-bold mb-3 md:mb-4"
                data-aos="zoom-y-out"
              >
                Get in Touch
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8 px-2 md:px-4">
                Have questions about the beta or feedback? We'd love to hear from you.
              </p>
              <Button 
                onClick={() => setOpen(true)}
                className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base"
              >
                Contact Us
              </Button>
              <MessageModal open={open} onOpenChange={setOpen} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}