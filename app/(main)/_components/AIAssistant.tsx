import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AiGenerationIcon from '@/icons/AI-Generation'
import AiGenerationIconWhite from '@/icons/AI-Generation-White'
import { Textarea } from '@/components/ui/textarea'

type AIAssistantProps = {
  onAIGenerate: (prompt: string) => Promise<void>;
  isAiGenerating: boolean;
}

export default function AIAssistant({ onAIGenerate, isAiGenerating }: AIAssistantProps) {
  const [inputValue, setInputValue] = useState('')

  const handleSendRequest = () => {
    onAIGenerate(inputValue)
    setInputValue('')
  }

  return (
    <div className="p-4 w-full">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <Textarea
            className=""
            placeholder="Ask AI to make adjustments..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendRequest();
              }
            }}
          />
        <Button 
          className="gap-2 h-full"
          onClick={handleSendRequest}
          disabled={isAiGenerating}
        >
            {isAiGenerating ? 'Generating...' : 'Send'}
            <AiGenerationIconWhite />
          </Button>
        </div>
      </div>
    </div>
  )
}
