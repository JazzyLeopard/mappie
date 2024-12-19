"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MessageModal } from "@/components/MessageModal";
import { Button } from "@/components/ui/button"; // Assuming Button is imported from a UI library

export default function ContactSection() {
  const [open, setOpen] = useState(false); // Added state for modal visibility

  return (
    <section id="contact" className="relative min-h-[60vh]">
      {/* Background gradient */}
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-pink-400 to-blue-400 opacity-40 blur-[160px] will-change-[filter]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-12">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="shadow-xl shadow-gray-500/10 px-4 py-8 mb-12 bg-white/50 backdrop-blur-sm rounded-2xl md:px-8 md:py-12">
              <h2 
                className="text-3xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bold md:text-4xl mb-4"
                data-aos="zoom-y-out"
              >
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-8">
                Have questions about the beta or feedback? We'd love to hear from you.
              </p>
              <Button onClick={() => setOpen(true)}>
                Contact Us
              </Button>
              <MessageModal open={open} onOpenChange={setOpen} /> {/* Pass open state to MessageModal */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}