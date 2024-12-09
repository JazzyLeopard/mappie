"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const videos = [
  {
    id: "video1",
    emoji: "🤖",
    subtitle: "Product Walkthrough",
    title: "Product Walkthrough",
    description: "Transform vague ideas or messy requirements into structured product requirements",
    videoId: "YOUR_VIDEO_ID_1"
  },
  {
    id: "video2",
    emoji: "🗺️",
    subtitle: "Context-aware AI Assistant",
    title: "Context-aware AI Assistant",
    description: "Get AI-powered improvements for your documentation and requirements without leaving your current context",
    videoId: "YOUR_VIDEO_ID_2"
  },
  {
    id: "video3",
    emoji: "💡",
    subtitle: "Smart Suggestions",
    title: "Smart Suggestions",
    description: "Get AI-powered suggestions for your documentation and requirements",
    videoId: "YOUR_VIDEO_ID_3"
  }
];

export default function VideoDemo() {
  const [activeVideo, setActiveVideo] = useState(0);

  const nextVideo = () => {
    setActiveVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setActiveVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const getVisibleVideos = () => {
    const result = [];
    const totalVideos = videos.length;
    
    // Add previous video (or last video if we're at the start)
    const prevIndex = (activeVideo - 1 + totalVideos) % totalVideos;
    result.push({ ...videos[prevIndex], position: 'prev' });
    
    // Add current video
    result.push({ ...videos[activeVideo], position: 'current' });
    
    // Add next video (or first video if we're at the end)
    const nextIndex = (activeVideo + 1) % totalVideos;
    result.push({ ...videos[nextIndex], position: 'next' });
    
    return result;
  };

  return (
    <section id="video-demos" className="relative overflow-hidden min-h-[80vh]">
      {/* Enhanced gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2">
          <div className="h-full w-full rounded-[40rem] bg-gradient-to-tr from-[#F596D3]/40 via-[#A855D8]/40 to-[#39aed8]/40 opacity-70 blur-[120px] will-change-[filter]" />
        </div>
        <div className="absolute left-1/3 top-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2">
          <div className="h-full w-full rounded-[40rem] bg-gradient-to-br from-[#F596D3]/30 to-[#39aed8]/30 opacity-60 blur-[100px] will-change-[filter]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-4 md:py-8">
          {/* Section header */}
          <div className="mx-auto max-w-3xl shadow-xl shadow-gray-500/10 px-4 py-8 mb-12 bg-white/50 backdrop-blur-sm rounded-2xl text-center md:px-4 md:py-8">
            <h2 
              className="text-3xl bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent font-bold md:text-4xl"
              data-aos="zoom-y-out"
            >
              Product Demos
            </h2>
          </div>

          {/* Video Info */}
          <motion.div
            key={videos[activeVideo].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 mb-8 text-center"
          >
            <h3 className="text-2xl font-bold">{videos[activeVideo].title}</h3>
            <p className="mt-2 text-gray-600">{videos[activeVideo].description}</p>
          </motion.div>

          {/* Video Carousel */}
          <div className="relative mx-auto max-w-[900px]">
            {/* Videos Container */}
            <div className="relative flex h-[400px] items-center justify-center">
              <AnimatePresence mode="popLayout">
                {getVisibleVideos().map((video) => {
                  const positionStyles = {
                    prev: { x: '-70%', scale: 0.8, opacity: 0.5, zIndex: 0 },
                    current: { x: '0%', scale: 1, opacity: 1, zIndex: 1 },
                    next: { x: '70%', scale: 0.8, opacity: 0.5, zIndex: 0 }
                  };

                  return (
                    <motion.div
                      key={video.id}
                      className="absolute w-[600px] aspect-video rounded-[2rem] overflow-hidden"
                      initial={positionStyles[video.position as keyof typeof positionStyles]}
                      animate={positionStyles[video.position as keyof typeof positionStyles]}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#F596D3] via-[#A855D8] to-[#39aed8] opacity-10" />
                      
                      {/* Feature Label */}
                      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        <span>{video.emoji}</span>
                        <span>{video.subtitle}</span>
                      </div>

                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevVideo}
              className="absolute left-[35%] top-[420px] mt-4 z-20 -translate-y-1/2 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={nextVideo}
              className="absolute right-[35%] mt-4 top-[420px] z-20 -translate-y-1/2 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 