"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

const features = [
  {
    id: "feature1",
    emoji: "🤖",
    subtitle: "AI Requirements Gathering",
    title: "AI Requirements Gathering",
    description: "Transform vague ideas into structured requirements with our AI assistant",
    imagePath: "/Requirements.png"
  },
  {
    id: "feature2",
    emoji: "✏️",
    subtitle: "Story Generation",
    title: "Auto-generate Epics and User Stories",
    description: "Auto-generate Epics and User Stories that developers actually want to work with",
    imagePath: "/Stories.png"
  },
  {
    id: "feature3",
    emoji: "🔄",
    subtitle: "Context Aware AI-Assistant",
    title: "Ask questions about your project",
    description: "The AI assistant is context aware and will generate content based on the project you are working on",
    imagePath: "/Frame.png"
  },
  {
    id: "feature4",
    emoji: "💭",
    subtitle: "Inline AI Editing",
    title: "Get AI suggestions based on selected text",
    description: "Select text, click the AI button, and get suggestions for editing",
    imagePath: "/ai-edit.png"
  }
];

// ImageModal component definition
const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      className="relative max-h-[90vh] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -right-4 -top-4 rounded-full bg-white p-2 shadow-lg"
      >
        <X className="h-6 w-6" />
      </button>
      <Image
        src={src}
        width={1200}
        height={800}
        alt="Feature preview"
        className="rounded-lg object-contain"
      />
    </motion.div>
  </motion.div>
);

export default function BetaFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const getVisibleFeatures = () => {
    const result = [];
    const totalFeatures = features.length;
    
    const prevIndex = (activeFeature - 1 + totalFeatures) % totalFeatures;
    result.push({ ...features[prevIndex], position: 'prev' });
    
    result.push({ ...features[activeFeature], position: 'current' });
    
    const nextIndex = (activeFeature + 1) % totalFeatures;
    result.push({ ...features[nextIndex], position: 'next' });
    
    return result;
  };

  return (
    <section className="relative">
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-40 blur-[160px] will-change-[filter]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl mb-16 pb-16 text-center md:pb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl" data-aos="zoom-y-out">
              Beta Access Features
            </h2>
            <p className="text-lg text-gray-700" data-aos="zoom-y-out" data-aos-delay={200}>
              Join 100 teams getting early access to shape the future of project planning. 
              You can use all features for free while in beta.
            </p>
          </div>

          {/* Feature Carousel */}
          <div className="relative mx-auto max-w-[900px] min-h-[80vh]">
            {/* Features Container */}
            <div className="relative flex h-[400px] items-center justify-center">
              <AnimatePresence mode="popLayout">
                {getVisibleFeatures().map((feature) => {
                  const positionStyles = {
                    prev: { x: '-70%', scale: 0.8, opacity: 0.5, zIndex: 0 },
                    current: { x: '0%', scale: 1, opacity: 1, zIndex: 1 },
                    next: { x: '70%', scale: 0.8, opacity: 0.5, zIndex: 0 }
                  };

                  return (
                    <motion.div
                      key={feature.id}
                      initial={positionStyles[feature.position as keyof typeof positionStyles]}
                      animate={positionStyles[feature.position as keyof typeof positionStyles]}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute w-[600px] rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg"
                    >
                      {/* Feature Label */}
                      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        <span>{feature.emoji}</span>
                        <span>{feature.subtitle}</span>
                      </div>

                      {/* Image Container */}
                      <div 
                        className="relative aspect-[4/3] w-full p-8 cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => setModalImage(feature.imagePath)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] opacity-10" />
                        <Image
                          src={feature.imagePath}
                          fill
                          alt={feature.title}
                          className="object-contain p-8"
                        />
                      </div>

                      {/* Feature Info */}
                      <div className="p-6 text-center bg-white/80 backdrop-blur-sm">
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center mt-32">
              <button
                onClick={prevFeature}
                className="absolute left-[35%] z-20 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextFeature}
                className="absolute right-[35%] z-20 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalImage && (
        <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      )}
    </section>
  );
}