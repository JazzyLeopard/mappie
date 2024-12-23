'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
  title: string
  description: string
  image: string
  images: string[]
  backgroundColor: string
  titleColor?: string
}

const features: Feature[] = [
  {
    title: "Prompt generation",
    description: "Create comprehensive epics, requirements, features and stories using AI assistance",
    image: "/images-landing/Epics/Generate-Epic.png",
    images: [
      "/images-landing/Epics/Generate-Epic.png",
      "/images-landing/Epics/Generating.png",
      "/images-landing/Epics/Generated.png",
    ],
    backgroundColor: "bg-white"
  },
  {
    title: "Context-aware AI Chat",
    titleColor: "text-white",
    description: "Chat with AI assistants to get help with editing the content of your work item",
    image: "/images-landing/Epics/Ai-Chat.png",
    images: [
      "/images-landing/Epics/Ai-Chat.png",
      "/images-landing/Epics/Ai-Chat.png",
      "/images-landing/Epics/Ai-Chat.png",
    ],
    backgroundColor: "bg-slate-950"
  },
  {
    title: "Epic to Stories, Fast",
    description: "Convert your epics to requirements, features and stories, fastly in beautiful markdown",
    image: "/images-landing/Epics/userstory.png",
    images: [
      "/images-landing/Epics/userstory.png",
      "/images-landing/Epics/functionalrequirement.png",
      "/images-landing/Epics/usecase.png",
    ],
    backgroundColor: "bg-pink-50"
  },
  {
    title: "Inline AI Editing",
    description: "Edit your epics using AI-powered inline editing tools",
    image: "/images-landing/Epics/Ai-Edit.png",
    images: [
      "/images-landing/Epics/Ai-Edit.png",
      "/images-landing/Epics/Ai-Edit.png",
      "/images-landing/Epics/Ai-Edit.png",
    ],
    backgroundColor: "bg-blue-50"
  },
  {
    title: "Beautiful Docs",
    description: "Generate beautiful and professional-looking documentation about your product",
    image: "/images-landing/Epics/Generated.png",
    images: [
      "/images-landing/Epics/Generated.png",
      "/images-landing/Epics/Generated.png",
      "/images-landing/Epics/Generated.png",
    ],
    backgroundColor: "bg-white"
  }
]

export default function FeatureShowcaseCarousel() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const scrollAmount = currentIndex * (400 + 32) // card width + gap
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  return (
    <div className="w-full min-h-screen py-8 px-4 md:py-16 md:px-12 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="text-left mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Get to know our features.</h1>
        </div>
        
        <div className="relative flex-grow">
          <div 
            ref={containerRef}
            className="flex snap-x snap-mandatory overflow-x-auto gap-4 pb-8 h-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {features.map((feature, idx) => (
              <Card
                key={`${feature.title}-${idx}`}
                className={cn(
                  "w-[calc(100vw-2rem)] md:w-[400px] shrink-0 snap-center",
                  "rounded-3xl overflow-hidden transition-all duration-300",
                  "border border-gray-200/50 cursor-pointer",
                  "hover:shadow-lg"
                )}
                onClick={() => setSelectedFeature(feature)}
              >
                <div className={cn(
                  "relative h-[calc(70vh)] w-full p-10",
                  feature.backgroundColor,
                  feature.titleColor,
                  "flex flex-col"
                )}>
                  <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-3">
                      {feature.title}
                    </h2>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="relative flex-1 overflow-hidden rounded-2xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className={cn(
                        "object-cover",
                        feature.title.toLowerCase().includes('chat') 
                          ? "object-right-top" 
                          : "object-center"
                      )}
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
            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-white/90 disabled:opacity-50"
            onClick={handleNext}
            disabled={currentIndex === features.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-7xl w-[95vw] p-8 bg-white/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>{selectedFeature?.title}</DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-[16/9] w-full">
            {selectedFeature && (
              <Carousel className="w-full">
                <CarouselContent>
                  {selectedFeature.images.map((image, index) => (
                    <CarouselItem key={index} className="relative aspect-[16/9]">
                      <div className="relative w-full h-full">
                        <Image
                          src={image}
                          alt={`${selectedFeature.title} - ${index + 1}`}
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

