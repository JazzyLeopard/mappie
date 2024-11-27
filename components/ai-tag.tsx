import React from 'react'
import { Sparkles } from 'lucide-react'

interface AITagProps {
  text: string
}

export function AITag({ text }: AITagProps) {
  return (
    <div className="inline-flex items-center bg-purple-600 bg-opacity-50 text-white text-sm px-2 py-1 rounded-full mt-2">
      <Sparkles className="w-4 h-4 mr-1" />
      {text}
    </div>
  )
}

