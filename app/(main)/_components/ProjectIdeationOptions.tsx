import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface ProjectIdeationOptionsProps {
  onSelectOption: (option: 'paste' | 'generate' | 'blank') => void;
}

export default function ProjectIdeationOptions({ onSelectOption }: ProjectIdeationOptionsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
        How would you like to create your epic?
      </h2>

      {/* Cards Grid */}
      <div className="relative flex justify-center items-center gap-6 mt-8">
        {/* Paste in text */}
        <div onClick={() => onSelectOption('paste')} className="cursor-pointer w-full max-w-[280px] transform -rotate-3 transition-transform hover:-translate-y-1">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-pink-100">
              <div className="absolute inset-0 opacity-50 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zAvuVlWQNWI5aCxXe0bIcdzozL79vz.png')] bg-contain bg-center bg-no-repeat" />
            </div>
            <CardContent className="relative bg-white/95 mt-32 p-6">
              <h3 className="text-xl font-semibold mb-2">Paste in text</h3>
              <p className="text-sm text-gray-600 mb-8">
                Create from notes, an outline, or existing content
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Generate with AI */}
        <div onClick={() => onSelectOption('generate')} className="cursor-pointer w-full max-w-[320px] z-10 transform transition-transform hover:-translate-y-1">
          <Card className="relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-violet-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.violet.200)_0%,transparent_70%)]" />
            </div>
            <Badge className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Popular
            </Badge>
            <CardContent className="relative bg-white/95 mt-40 p-6">
              <h3 className="text-2xl font-semibold mb-2">Generate with AI</h3>
              <p className="text-sm text-gray-600 mb-8">
                Create documentation from a one-line prompt in
                <br />a few seconds
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Start from blank */}
        <div onClick={() => onSelectOption('blank')} className="cursor-pointer w-full max-w-[280px] transform rotate-3 transition-transform hover:-translate-y-1">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-100">
              <div className="absolute inset-0 opacity-50 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zAvuVlWQNWI5aCxXe0bIcdzozL79vz.png')] bg-contain bg-center bg-no-repeat" />
            </div>
            <CardContent className="relative bg-white/95 mt-32 p-6">
              <h3 className="text-xl font-semibold mb-2">Start from blank</h3>
              <p className="text-sm text-gray-600 mb-8">
                Create new docs from blank
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 