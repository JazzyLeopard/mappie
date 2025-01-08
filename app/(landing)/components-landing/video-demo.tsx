"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const videos = [
  {
    id: "video1",
    title: "Product Walkthrough",
    description: "Transform vague ideas or messy requirements into structured product requirements",
    videoId: "YOUR_VIDEO_ID_1",
    backgroundColor: "bg-white"
  },
  {
    id: "video2",
    title: "Context-aware AI Assistant",
    description: "Get AI-powered improvements for your documentation and requirements without leaving your current context",
    videoId: "YOUR_VIDEO_ID_2",
    backgroundColor: "bg-slate-200",
    titleColor: "text-black"
  },
  {
    id: "video3",
    title: "Smart Suggestions",
    description: "Get AI-powered suggestions for your documentation and requirements",
    videoId: "YOUR_VIDEO_ID_3",
    backgroundColor: "bg-pink-50"
  }
];

export default function VideoDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = currentIndex * (800 + 32); // wider card width + gap
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <div id="video-demos" className="w-full min-h-screen py-8 md:py-16 md: overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="text-left mb-8 md:mb-12"> 
          <h1 className="text-3xl md:text-5xl font-bold mb-4 ml-4 md:ml-12">Product Demos</h1>
        </div>

        <div className="relative flex-grow">
          <div
            ref={containerRef}
            className="flex snap-x snap-mandatory overflow-x-auto pb-8 h-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {videos.map((video) => (
              <Card
                key={video.id}
                className={cn(
                  "w-[calc(100vw-2rem)] ml-4 md:ml-8 md:w-[800px] shrink-0 snap-center",
                  "rounded-3xl overflow-hidden transition-all duration-300",
                  "border border-gray-200/50",
                  "hover:shadow-lg"
                )}
              >
                <div className={cn(
                  "relative h-[70vh] w-full p-6 md:p-10",
                  video.backgroundColor,
                  video.titleColor,
                  "flex flex-col"
                )}>
                  <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-3">
                      {video.title}
                    </h2>
                    <p className="text-gray-600">
                      {video.description}
                    </p>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-2xl">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/tXRGwB2Yl_4`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-8 right-8 rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  >
                    <Search className="h-6 w-6" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4 md:mt-8 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-white/90"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-white/90"
            onClick={handleNext}
            disabled={currentIndex === videos.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
} 