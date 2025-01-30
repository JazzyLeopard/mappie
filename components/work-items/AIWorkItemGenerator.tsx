"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Wand2, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type WorkItemType = "epic" | "feature" | "story" | "task"

interface AIWorkItemGeneratorProps {
  type: WorkItemType
  context: string[] // Knowledge base item IDs
  onGenerate: (workItem: any) => void
}

export function AIWorkItemGenerator({
  type,
  context,
  onGenerate
}: AIWorkItemGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState("")
  const [selectedOption, setSelectedOption] = useState<"single" | "multiple" | "withChildren">("single")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Temporary mock data for UI development
  const mockGeneratedItems = [
    {
      title: "Sample Generated Item 1",
      description: "This is a sample description for the first generated item."
    },
    {
      title: "Sample Generated Item 2",
      description: "This is a sample description for the second generated item."
    }
  ]

  const generationOptions = {
    epic: [
      { id: "single", label: "Generate single Epic" },
      { id: "multiple", label: "Generate multiple related Epics" },
      { id: "withChildren", label: "Generate Epic with Feature suggestions" }
    ],
    feature: [
      { id: "single", label: "Generate single Feature" },
      { id: "multiple", label: "Generate multiple related Features" },
      { id: "withChildren", label: "Generate Feature with Story suggestions" }
    ],
    story: [
      { id: "single", label: "Generate single Story" },
      { id: "multiple", label: "Generate multiple related Stories" },
      { id: "withChildren", label: "Generate Story with Task suggestions" }
    ],
    task: [
      { id: "single", label: "Generate single Task" },
      { id: "multiple", label: "Generate multiple related Tasks" }
    ]
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {/* Generation Options */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Generation Options</h3>
        <div className="grid gap-2">
          {generationOptions[type].map((option) => (
            <Button
              key={option.id}
              variant={selectedOption === option.id ? "default" : "outline"}
              onClick={() => setSelectedOption(option.id as typeof selectedOption)}
              className="justify-start"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Custom Instructions (Optional)</h3>
        <Textarea
          placeholder="Add any specific requirements or context..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={3}
        />
      </div>

      {/* Generated Content */}
      <ScrollArea className="h-[200px] rounded-md border p-4">
        {mockGeneratedItems.map((item, index) => (
          <Card key={index} className="p-4 mb-2">
            <h4 className="font-medium">{item.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => onGenerate(item)}
            >
              Use This
            </Button>
          </Card>
        ))}
      </ScrollArea>

      {/* Generate Button */}
      <Button 
        className="w-full" 
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate
          </>
        )}
      </Button>
    </div>
  )
} 